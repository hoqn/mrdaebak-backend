import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { IngScheduleService } from "./ingschedule.service";

@Controller('ing-schedule')
export class IngScheduleController {
    constructor(
        private readonly ingScheduleService: IngScheduleService,
    ) {}

    @Get()
    public async getSchedules(
        @Query('ingredient_id') ingredientId: number,
        @Query('date_from') dateFrom: string | any,
        @Query('date_to') dateTo: string | any,
    ) {
        let d1 = dateFrom ? new Date(dateFrom) : new Date();
        let d2 = dateTo   ? new Date(dateTo  ) : new Date();

        return this.ingScheduleService.getIngSchedule([
            d1, d2
        ]);
    }
}