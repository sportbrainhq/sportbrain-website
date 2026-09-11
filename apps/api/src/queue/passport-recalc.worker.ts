import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Worker, type Job } from 'bullmq';
import { PassportService } from '../modules/passport/passport.service';
import { PASSPORT_RECALC_QUEUE, type PassportRecalcJobData } from './queue.types';
import { QueueService } from './queue.service';

/**
 * Consumes `passport-recalc` jobs enqueued by `QuizAttemptsService.complete()`
 * (Part 69): quiz completion is never blocked on Passport recalculation, so
 * this worker is the only place `PassportService.recalculateUserScore` runs
 * for a real quiz completion. A failed job is logged and left to BullMQ's
 * retry policy rather than losing the quiz result — the quiz was already
 * saved by `QuizAttemptsService` before this job was ever enqueued.
 */
@Injectable()
export class PassportRecalcWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PassportRecalcWorker.name);
  private worker: Worker<PassportRecalcJobData> | undefined;

  constructor(
    private readonly queueService: QueueService,
    private readonly passportService: PassportService,
  ) {}

  onModuleInit(): void {
    const connection = this.queueService.getConnection();
    if (!this.queueService.enabled || !connection) {
      this.logger.warn('Queue disabled (no REDIS_URL): passport-recalc worker not started');
      return;
    }

    this.worker = new Worker<PassportRecalcJobData>(
      PASSPORT_RECALC_QUEUE,
      async (job: Job<PassportRecalcJobData>) => {
        const { userId, quizAttemptId, justCompletedQuiz } = job.data;
        await this.passportService.recalculateUserScore(userId, {
          justCompletedQuiz: justCompletedQuiz
            ? {
                quizAttemptId,
                quizType: justCompletedQuiz.quizType,
                sportId: justCompletedQuiz.sportId,
                questionCount: justCompletedQuiz.questionCount,
                correctCount: justCompletedQuiz.correctCount,
                percentage: justCompletedQuiz.percentage,
                completedAt: new Date(justCompletedQuiz.completedAt),
              }
            : undefined,
        });
      },
      { connection, concurrency: 5 },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `passport-recalc job ${job?.id} failed (userId "${job?.data?.userId}"): ${error.message}`,
      );
    });

    this.logger.log('passport-recalc worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
