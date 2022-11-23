import { CONFIG } from "@/config";
import * as moment from "moment";

const yoilConfig = CONFIG.ingredients.deliveredDate.byDayOfWeek;
const deliveryYoils = [
    yoilConfig.sun,
    yoilConfig.mon,
    yoilConfig.tue,
    yoilConfig.wed,
    yoilConfig.thu,
    yoilConfig.fri,
    yoilConfig.sat,
];

export function getNextIngredientDeliveryDate(date: Date, includeThatDay: boolean): Date {
    const yoil = date.getDay();

    for (let i = includeThatDay ? 0 : 1; i <= 7; i++) {
        if (deliveryYoils[(yoil + i) % 7]) {
            return moment(date).add(i, 'days').toDate();
        }
    }

    return null;
}