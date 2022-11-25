import { CONFIG } from "@/config";
import { OrderState } from "@/model/enum";
import { IngScheduleService } from "@/service/ingschedule.service";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as moment from "moment";
import { Raw } from "typeorm";
import { IngredientService } from "./ingredient.service";
import { OrderService } from "./order.service";

@Injectable()
export class StoreService {

    constructor(
        private readonly ingredientService: IngredientService,
        private readonly ingScheduleService: IngScheduleService,
        private readonly orderService: OrderService,
    ) { }

    readonly ingDeliveryYoilData = CONFIG.ingredients.deliveredDate.byDayOfWeek;
    readonly ingDeliveryYoils = [
        this.ingDeliveryYoilData.sun,
        this.ingDeliveryYoilData.mon,
        this.ingDeliveryYoilData.tue,
        this.ingDeliveryYoilData.wed,
        this.ingDeliveryYoilData.thu,
        this.ingDeliveryYoilData.fri,
        this.ingDeliveryYoilData.sat,
    ]

    @Cron('0 15 * * *', {
        name: 'before-opening',
        timeZone: 'Asia/Seoul',
    })
    async prepareOpening() {
        const today = new Date();
        const todayString = moment(today).format('yyyy-MM-DD');

        if (this.ingDeliveryYoils[today.getDay()]) {
            // 재료 배달 완료
            this.ingredientService.copyAllOrderToInAmount(today);
        }


        // 잡혀있는 대기 주문들 예약 주문으로 전환
        const orders = await this.orderService.getOrdersBy({ orderState: OrderState.HOLD, rsvDate: Raw((alias) => `DATE(${alias}) = '${todayString}'`) });
        console.log('Orders', orders.items.length);

        orders.items.forEach((order) => {
            this.orderService.setOrderState(order.orderId, OrderState.WAITING)
                .then(() => console.log(`${order.orderId}번 주문이 예약되었습니다.`));
        });
    }

}