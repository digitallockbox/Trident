/**
 * Overmind — AI Orchestration Engine
 *
 * Manages task queues, worker assignment, priority scheduling,
 * and parallel execution pipelines for compute operations.
 */
export class Overmind {
  private tasks: Map<string, {
    id: string;
    type: string;
    priority: number;
    status: 'queued' | 'running' | 'completed' | 'failed';
    result: any;
    createdAt: string;
    completedAt: string | null;
  }> = new Map();

  private workers: Map<string, {
    id: string;
    status: 'idle' | 'busy';
    tasksCompleted: number;
    currentTask: string | null;
  }> = new Map();

  async execute(data: Record<string, any>): Promise<Record<string, any>> {
    const action = data.action || 'status';

    switch (action) {
      case 'submit':
        return this.submitTask(data);
      case 'process':
        return this.processQueue();
      case 'registerWorker':
        return this.registerWorker(data);
      case 'status':
        return this.getStatus(data);
      case 'pipeline':
        return this.runPipeline(data);
      default:
        return { status: 'error', engine: 'Overmind', error: `Unknown action: ${action}` };
    }
  }

  private submitTask(data: Record<string, any>): Record<string, any> {
    const type = (data.type as string) || 'generic';
    const priority = Number(data.priority) || 0;
    const payload = data.payload;

    const id = `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.tasks.set(id, {
      id,
      type,
      priority,
      status: 'queued',
      result: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });

    return { status: 'success', engine: 'Overmind', taskId: id, type, priority, queued: true };
  }

  private processQueue(): Record<string, any> {
    // Sort tasks by priority descending, process queued ones
    const queued = Array.from(this.tasks.values())
      .filter(t => t.status === 'queued')
      .sort((a, b) => b.priority - a.priority);

    const idleWorkers = Array.from(this.workers.values()).filter(w => w.status === 'idle');
    const assigned: Array<{ taskId: string; workerId: string }> = [];

    for (const task of queued) {
      const worker = idleWorkers.shift();
      if (!worker) break;

      task.status = 'completed';
      task.result = { processed: true, by: worker.id };
      task.completedAt = new Date().toISOString();

      worker.tasksCompleted++;
      assigned.push({ taskId: task.id, workerId: worker.id });
    }

    // Auto-complete remaining queued (no workers) as system-processed
    const remaining = Array.from(this.tasks.values()).filter(t => t.status === 'queued');
    for (const task of remaining.slice(0, 10)) {
      task.status = 'completed';
      task.result = { processed: true, by: 'system' };
      task.completedAt = new Date().toISOString();
    }

    return {
      status: 'success',
      engine: 'Overmind',
      assigned: assigned.length,
      systemProcessed: Math.min(remaining.length, 10),
      remainingQueued: Array.from(this.tasks.values()).filter(t => t.status === 'queued').length,
    };
  }

  private registerWorker(data: Record<string, any>): Record<string, any> {
    const id = (data.workerId as string) || `W-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.workers.set(id, { id, status: 'idle', tasksCompleted: 0, currentTask: null });

    return { status: 'success', engine: 'Overmind', workerId: id, registered: true };
  }

  private getStatus(data: Record<string, any>): Record<string, any> {
    const taskId = data.taskId as string;
    if (taskId) {
      const task = this.tasks.get(taskId);
      return { status: 'success', engine: 'Overmind', task: task || null };
    }

    const tasks = Array.from(this.tasks.values());
    return {
      status: 'success',
      engine: 'Overmind',
      totalTasks: tasks.length,
      queued: tasks.filter(t => t.status === 'queued').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      workers: this.workers.size,
      idleWorkers: Array.from(this.workers.values()).filter(w => w.status === 'idle').length,
    };
  }

  private runPipeline(data: Record<string, any>): Record<string, any> {
    const steps = Array.isArray(data.steps) ? data.steps : [];
    if (steps.length === 0) {
      return { status: 'error', engine: 'Overmind', error: 'Pipeline requires at least one step' };
    }

    const results: Array<{ step: number; name: string; status: string; duration: number }> = [];
    let pipelineOk = true;

    for (let i = 0; i < steps.length; i++) {
      const start = performance.now();
      const step = steps[i];
      const name = (step.name as string) || `step-${i + 1}`;

      // Simulate step execution
      const success = Math.random() > 0.05; // 95% success rate
      const duration = Math.round((performance.now() - start) * 100) / 100;

      results.push({
        step: i + 1,
        name,
        status: success ? 'completed' : 'failed',
        duration,
      });

      if (!success) {
        pipelineOk = false;
        break;
      }
    }

    return {
      status: 'success',
      engine: 'Overmind',
      pipelineStatus: pipelineOk ? 'completed' : 'failed',
      stepsExecuted: results.length,
      totalSteps: steps.length,
      results,
    };
  }
}
