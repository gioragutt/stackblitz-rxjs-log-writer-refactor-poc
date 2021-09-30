import './style.css';

import {
  Subject,
  race,
  timer,
  filter,
  take,
  firstValueFrom,
  fromEvent,
} from 'rxjs';
import { tap } from 'rxjs/operators';

class LogsWriter {
  readonly minLength = 3;
  readonly logArrived = new Subject<void>();
  looping = false;
  queue: string[] = [];

  stop() {
    this.looping = false;
  }

  async loop() {
    this.looping = true;
    while (this.looping) {
      if (this.queue.length) {
        await this.sendLogs();
        continue;
      }
      console.log('no items, sleeping');
      await this.waitForNextTrigger();
    }
  }

  private async waitForNextTrigger() {
    await firstValueFrom(
      race(
        timer(2000),
        this.logArrived.pipe(
          filter(() => this.queue.length >= this.minLength),
          tap(() => console.log('enough items'))
        )
      ).pipe(take(1))
    );
  }

  private async sendLogs() {
    console.log('deleted', this.queue.splice(0, 3));
    await new Promise((res) => setTimeout(res, 2000));
  }
}

const logsWriter = new LogsWriter();

fromEvent(document.querySelector('#add'), 'click').forEach(() => {
  logsWriter.queue.push('bla' + Date.now());
  logsWriter.logArrived.next();
});

fromEvent(document.querySelector('#add10'), 'click').forEach(() => {
  for (let i = 0; i < 10; i++) {
    logsWriter.queue.push('bla' + Date.now());
  }
  logsWriter.logArrived.next();
});

logsWriter.loop();
