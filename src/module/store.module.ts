import { Ingredient, IngredientCategory } from "@/model/entity";
import { IngredientService, StoreService } from "@/service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Ingredient, IngredientCategory ]),
    ],
    providers: [StoreService, IngredientService],
})
export class StoreModule {}