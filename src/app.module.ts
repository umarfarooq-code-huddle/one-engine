import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OnDemandModule } from './on-demand/on-demand.module';


@Module({
  imports: [OnDemandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
