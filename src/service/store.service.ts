import { CONFIG } from "@/config";
import { Injectable } from "@nestjs/common";
import moment from "moment";
import { IngredientService } from "./ingredient.service";

@Injectable()
export class StoreService {
    constructor(
        private readonly ingredientService: IngredientService,
    ) {}

    async openStore() {
        // 재료 받기
        this.receiveOrderedIngredients();
    }

    private async receiveOrderedIngredients() {
        const today = moment();
        const yoil = today.day();

        const deliveredYoil = CONFIG.ingredients.deliveredDate.byDayOfWeek;

        let delivered: boolean = false;

        switch(yoil) {
            case 0: delivered = deliveredYoil.sun; break;
            case 1: delivered = deliveredYoil.mon; break;
            case 2: delivered = deliveredYoil.tue; break;
            case 3: delivered = deliveredYoil.wed; break;
            case 4: delivered = deliveredYoil.thu; break;
            case 5: delivered = deliveredYoil.fri; break;
            case 6: delivered = deliveredYoil.sat; break;
        }

        if(delivered) {
            // 재료를 받는다.
            this.ingredientService.receiveAllIngredientOrderStock();
        }
    }
}