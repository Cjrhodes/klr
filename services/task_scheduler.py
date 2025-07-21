import schedule
import time
import threading
import logging
from typing import Dict, Any, List, Callable
from datetime import datetime, timedelta
import json
import asyncio
from dataclasses import dataclass, asdict
from enum import Enum

from agents.project_lead_agent import ProjectLeadAgent
from services.claude_service import ClaudeService

logger = logging.getLogger(__name__)

class TaskType(Enum):
    CONTENT_GENERATION = "content_generation"
    SOCIAL_POST = "social_post" 
    ANALYTICS_REPORT = "analytics_report"
    IMAGE_GENERATION = "image_generation"
    CAMPAIGN_REVIEW = "campaign_review"
    PERFORMANCE_ANALYSIS = "performance_analysis"

class TaskStatus(Enum):
    SCHEDULED = "scheduled"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class ScheduledTask:
    task_id: str
    task_type: TaskType
    name: str
    description: str
    schedule_pattern: str
    parameters: Dict[str, Any]
    enabled: bool
    created_at: datetime
    last_run: datetime = None
    next_run: datetime = None
    status: TaskStatus = TaskStatus.SCHEDULED
    run_count: int = 0
    error_count: int = 0
    last_error: str = ""

class TaskScheduler:
    def __init__(self):
        self.tasks: Dict[str, ScheduledTask] = {}
        self.project_lead = ProjectLeadAgent()
        self.claude_service = ClaudeService()
        self.scheduler_thread = None
        self.running = False
        self.tasks_file = "config/scheduled_tasks.json"
        
        # Load existing tasks
        self._load_tasks()
        
    def start_scheduler(self):
        """Start the task scheduler in a separate thread"""
        if not self.running:
            self.running = True
            self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
            self.scheduler_thread.start()
            logger.info("Task scheduler started")

    def stop_scheduler(self):
        """Stop the task scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()
        logger.info("Task scheduler stopped")

    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                time.sleep(60)  # Wait longer on error

    def schedule_task(
        self,
        task_type: str,
        schedule_pattern: str,
        parameters: Dict[str, Any],
        name: str = None,
        description: str = None
    ) -> Dict[str, Any]:
        """Schedule a new automated task"""
        try:
            # Generate task ID
            task_id = f"{task_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Validate task type
            try:
                task_type_enum = TaskType(task_type)
            except ValueError:
                return {"success": False, "error": f"Invalid task type: {task_type}"}
            
            # Create task
            task = ScheduledTask(
                task_id=task_id,
                task_type=task_type_enum,
                name=name or f"{task_type.replace('_', ' ').title()} Task",
                description=description or f"Automated {task_type} task",
                schedule_pattern=schedule_pattern,
                parameters=parameters,
                enabled=True,
                created_at=datetime.now()
            )
            
            # Schedule with the scheduler
            self._create_schedule_job(task)
            
            # Store task
            self.tasks[task_id] = task
            self._save_tasks()
            
            logger.info(f"Task scheduled: {task_id} - {schedule_pattern}")
            
            return {
                "success": True,
                "task_id": task_id,
                "message": f"Task '{task.name}' scheduled successfully",
                "schedule": schedule_pattern,
                "next_run": self._calculate_next_run(schedule_pattern)
            }
            
        except Exception as e:
            logger.error(f"Error scheduling task: {str(e)}")
            return {"success": False, "error": str(e)}

    def _create_schedule_job(self, task: ScheduledTask):
        """Create a schedule job for the task"""
        def job_wrapper():
            asyncio.create_task(self._execute_task(task))
        
        # Parse schedule pattern and create job
        pattern = task.schedule_pattern.lower()
        
        if pattern == "daily":
            schedule.every().day.at("09:00").do(job_wrapper).tag(task.task_id)
        elif pattern == "weekly":
            schedule.every().monday.at("09:00").do(job_wrapper).tag(task.task_id)
        elif pattern == "monthly":
            schedule.every().month.do(job_wrapper).tag(task.task_id)
        elif pattern.startswith("every ") and "hours" in pattern:
            hours = int(pattern.split()[1])
            schedule.every(hours).hours.do(job_wrapper).tag(task.task_id)
        elif pattern.startswith("every ") and "minutes" in pattern:
            minutes = int(pattern.split()[1])
            schedule.every(minutes).minutes.do(job_wrapper).tag(task.task_id)
        elif "at" in pattern:  # e.g., "daily at 14:30"
            parts = pattern.split()
            time_part = parts[-1]  # Last part should be time
            if "daily" in pattern:
                schedule.every().day.at(time_part).do(job_wrapper).tag(task.task_id)
            elif "monday" in pattern:
                schedule.every().monday.at(time_part).do(job_wrapper).tag(task.task_id)
            elif "tuesday" in pattern:
                schedule.every().tuesday.at(time_part).do(job_wrapper).tag(task.task_id)
            # Add more days as needed
        else:
            # Default to daily at 9 AM for unrecognized patterns
            schedule.every().day.at("09:00").do(job_wrapper).tag(task.task_id)
            logger.warning(f"Unrecognized schedule pattern '{pattern}', defaulting to daily at 9 AM")

    async def _execute_task(self, task: ScheduledTask):
        """Execute a scheduled task"""
        try:
            logger.info(f"Executing task: {task.task_id} - {task.name}")
            
            # Update task status
            task.status = TaskStatus.RUNNING
            task.last_run = datetime.now()
            task.run_count += 1
            
            result = None
            
            # Execute based on task type
            if task.task_type == TaskType.CONTENT_GENERATION:
                result = await self._execute_content_generation_task(task)
            elif task.task_type == TaskType.SOCIAL_POST:
                result = await self._execute_social_post_task(task)
            elif task.task_type == TaskType.ANALYTICS_REPORT:
                result = await self._execute_analytics_report_task(task)
            elif task.task_type == TaskType.IMAGE_GENERATION:
                result = await self._execute_image_generation_task(task)
            elif task.task_type == TaskType.CAMPAIGN_REVIEW:
                result = await self._execute_campaign_review_task(task)
            elif task.task_type == TaskType.PERFORMANCE_ANALYSIS:
                result = await self._execute_performance_analysis_task(task)
            
            # Update task status
            if result and result.get("success", False):
                task.status = TaskStatus.COMPLETED
                task.last_error = ""
            else:
                task.status = TaskStatus.FAILED
                task.error_count += 1
                task.last_error = result.get("error", "Unknown error") if result else "No result returned"
            
            # Save updated task
            self._save_tasks()
            
            logger.info(f"Task completed: {task.task_id} - Status: {task.status.value}")
            
        except Exception as e:
            logger.error(f"Error executing task {task.task_id}: {str(e)}")
            task.status = TaskStatus.FAILED
            task.error_count += 1
            task.last_error = str(e)
            self._save_tasks()

    async def _execute_content_generation_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute content generation task"""
        try:
            parameters = task.parameters
            content_request = {
                "content_type": parameters.get("content_type", "post"),
                "platform": parameters.get("platform", "instagram"),
                "topic": parameters.get("topic", "The Dark Road promotion"),
                "tone": parameters.get("tone", "engaging"),
                "include_images": parameters.get("include_images", True)
            }
            
            result = await self.project_lead.coordinate_content_generation(content_request)
            
            # Optionally auto-post if configured
            if parameters.get("auto_post", False) and result.get("success"):
                # Schedule social post with generated content
                await self._auto_schedule_social_post(result, parameters)
            
            return {"success": True, "result": result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_social_post_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute social media post task"""
        try:
            parameters = task.parameters
            post_request = {
                "platforms": parameters.get("platforms", ["instagram"]),
                "content": parameters.get("content", ""),
                "images": parameters.get("images", []),
                "hashtags": parameters.get("hashtags", [])
            }
            
            # Generate content if not provided
            if not post_request["content"]:
                content_result = await self.claude_service.generate_social_content(
                    platform=post_request["platforms"][0],
                    content_type="post",
                    topic=parameters.get("topic", "The Dark Road"),
                    tone=parameters.get("tone", "engaging")
                )
                post_request["content"] = content_result.get("content", "")
                post_request["hashtags"] = content_result.get("hashtags", [])
            
            # Post to social media
            from agents.social_media_agent import SocialMediaAgent
            social_agent = SocialMediaAgent()
            result = await social_agent.post_content(post_request)
            
            return {"success": True, "result": result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_analytics_report_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute analytics report task"""
        try:
            analytics = await self.project_lead.get_performance_analytics()
            
            # Generate report summary using Claude
            report_prompt = f"""
            Create a marketing performance summary report for 'The Dark Road' based on this analytics data:
            
            {json.dumps(analytics, indent=2)}
            
            Include:
            1. Key performance highlights
            2. Areas for improvement
            3. Actionable recommendations
            4. Trend analysis
            5. Next week's focus areas
            
            Keep it concise and actionable for marketing team.
            """
            
            report = await self.claude_service.generate_content(report_prompt)
            
            # Optionally email the report
            if task.parameters.get("email_report", False):
                await self._send_analytics_email(report, task.parameters)
            
            return {
                "success": True,
                "result": {
                    "analytics": analytics,
                    "report": report,
                    "generated_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_image_generation_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute image generation task"""
        try:
            from agents.graphic_artist_agent import GraphicArtistAgent
            
            parameters = task.parameters
            graphic_agent = GraphicArtistAgent()
            
            result = await graphic_agent.generate_image(
                prompt=parameters.get("prompt", "The Dark Road book marketing image"),
                style=parameters.get("style", "horror")
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_campaign_review_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute campaign review task"""
        try:
            # Get current campaign performance
            analytics = await self.project_lead.get_performance_analytics()
            
            # Generate review using Claude
            review_prompt = f"""
            Conduct a comprehensive campaign review for 'The Dark Road' marketing efforts:
            
            Current Performance Data:
            {json.dumps(analytics, indent=2)}
            
            Provide:
            1. Campaign effectiveness assessment
            2. ROI analysis
            3. Audience engagement evaluation
            4. Content performance review
            5. Strategic recommendations for optimization
            6. Budget reallocation suggestions
            
            Focus on actionable insights for improving campaign results.
            """
            
            review = await self.claude_service.generate_content(review_prompt)
            
            return {
                "success": True,
                "result": {
                    "review": review,
                    "analytics": analytics,
                    "reviewed_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_performance_analysis_task(self, task: ScheduledTask) -> Dict[str, Any]:
        """Execute performance analysis task"""
        try:
            # Get comprehensive analytics from all agents
            performance_data = {
                "social_media": await self.project_lead.social_media.get_analytics(),
                "web_analytics": await self.project_lead.web_it.get_analytics(),
                "campaign_metrics": await self.project_lead.marketing_lead.get_campaign_metrics(),
                "visual_performance": await self.project_lead.graphic_artist.get_performance_metrics()
            }
            
            # Generate analysis using Claude
            analysis_prompt = f"""
            Perform deep performance analysis for 'The Dark Road' marketing campaign:
            
            Performance Data:
            {json.dumps(performance_data, indent=2)}
            
            Analyze:
            1. Cross-platform performance comparison
            2. Content type effectiveness
            3. Audience behavior patterns
            4. Conversion funnel optimization
            5. Seasonal trends and opportunities
            6. Competitive positioning
            7. Resource allocation efficiency
            
            Provide specific, data-driven recommendations for improving overall marketing performance.
            """
            
            analysis = await self.claude_service.generate_content(analysis_prompt)
            
            return {
                "success": True,
                "result": {
                    "analysis": analysis,
                    "performance_data": performance_data,
                    "analyzed_at": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _calculate_next_run(self, schedule_pattern: str) -> str:
        """Calculate next run time for a schedule pattern"""
        try:
            # This is a simplified calculation
            now = datetime.now()
            pattern = schedule_pattern.lower()
            
            if pattern == "daily":
                next_run = now.replace(hour=9, minute=0, second=0, microsecond=0)
                if next_run <= now:
                    next_run += timedelta(days=1)
            elif pattern == "weekly":
                next_run = now + timedelta(days=7-now.weekday())
                next_run = next_run.replace(hour=9, minute=0, second=0, microsecond=0)
            elif pattern == "monthly":
                if now.month == 12:
                    next_run = now.replace(year=now.year+1, month=1, day=1, hour=9, minute=0, second=0, microsecond=0)
                else:
                    next_run = now.replace(month=now.month+1, day=1, hour=9, minute=0, second=0, microsecond=0)
            else:
                next_run = now + timedelta(hours=1)
            
            return next_run.isoformat()
            
        except Exception:
            return (datetime.now() + timedelta(hours=1)).isoformat()

    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Get all scheduled tasks"""
        try:
            tasks_list = []
            for task in self.tasks.values():
                task_dict = asdict(task)
                # Convert datetime objects to ISO strings
                for key, value in task_dict.items():
                    if isinstance(value, datetime):
                        task_dict[key] = value.isoformat() if value else None
                    elif isinstance(value, (TaskType, TaskStatus)):
                        task_dict[key] = value.value
                
                tasks_list.append(task_dict)
            
            return tasks_list
            
        except Exception as e:
            logger.error(f"Error getting all tasks: {str(e)}")
            return []

    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get specific task by ID"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task_dict = asdict(task)
            
            # Convert datetime and enum objects
            for key, value in task_dict.items():
                if isinstance(value, datetime):
                    task_dict[key] = value.isoformat() if value else None
                elif isinstance(value, (TaskType, TaskStatus)):
                    task_dict[key] = value.value
            
            return {"success": True, "task": task_dict}
        else:
            return {"success": False, "error": f"Task {task_id} not found"}

    def pause_task(self, task_id: str) -> Dict[str, Any]:
        """Pause a scheduled task"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.enabled = False
            task.status = TaskStatus.PAUSED
            
            # Remove from scheduler
            schedule.clear(task_id)
            
            self._save_tasks()
            return {"success": True, "message": f"Task {task_id} paused"}
        else:
            return {"success": False, "error": f"Task {task_id} not found"}

    def resume_task(self, task_id: str) -> Dict[str, Any]:
        """Resume a paused task"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.enabled = True
            task.status = TaskStatus.SCHEDULED
            
            # Re-add to scheduler
            self._create_schedule_job(task)
            
            self._save_tasks()
            return {"success": True, "message": f"Task {task_id} resumed"}
        else:
            return {"success": False, "error": f"Task {task_id} not found"}

    def delete_task(self, task_id: str) -> Dict[str, Any]:
        """Delete a scheduled task"""
        if task_id in self.tasks:
            # Remove from scheduler
            schedule.clear(task_id)
            
            # Remove from tasks dict
            del self.tasks[task_id]
            
            self._save_tasks()
            return {"success": True, "message": f"Task {task_id} deleted"}
        else:
            return {"success": False, "error": f"Task {task_id} not found"}

    def _save_tasks(self):
        """Save tasks to file"""
        try:
            import os
            os.makedirs("config", exist_ok=True)
            
            # Convert tasks to serializable format
            tasks_data = {}
            for task_id, task in self.tasks.items():
                task_dict = asdict(task)
                
                # Convert datetime objects to ISO strings
                for key, value in task_dict.items():
                    if isinstance(value, datetime):
                        task_dict[key] = value.isoformat() if value else None
                    elif isinstance(value, (TaskType, TaskStatus)):
                        task_dict[key] = value.value
                
                tasks_data[task_id] = task_dict
            
            with open(self.tasks_file, "w") as f:
                json.dump(tasks_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving tasks: {str(e)}")

    def _load_tasks(self):
        """Load tasks from file"""
        try:
            if not os.path.exists(self.tasks_file):
                return
            
            with open(self.tasks_file, "r") as f:
                tasks_data = json.load(f)
            
            for task_id, task_dict in tasks_data.items():
                # Convert ISO strings back to datetime objects
                for key, value in task_dict.items():
                    if key in ["created_at", "last_run", "next_run"] and value:
                        task_dict[key] = datetime.fromisoformat(value)
                    elif key == "task_type":
                        task_dict[key] = TaskType(value)
                    elif key == "status":
                        task_dict[key] = TaskStatus(value)
                
                # Create ScheduledTask object
                task = ScheduledTask(**task_dict)
                self.tasks[task_id] = task
                
                # Re-schedule if enabled
                if task.enabled and task.status != TaskStatus.PAUSED:
                    self._create_schedule_job(task)
            
            logger.info(f"Loaded {len(self.tasks)} scheduled tasks")
            
        except Exception as e:
            logger.error(f"Error loading tasks: {str(e)}")

    async def _auto_schedule_social_post(self, content_result: Dict[str, Any], parameters: Dict[str, Any]):
        """Auto-schedule social media post with generated content"""
        # This would implement logic to automatically post generated content
        pass

    async def _send_analytics_email(self, report: str, parameters: Dict[str, Any]):
        """Send analytics report via email"""
        # This would implement email sending functionality
        pass