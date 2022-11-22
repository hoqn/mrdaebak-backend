import { IngredientModule, StoreModule } from "@/module";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import * as request from "supertest";

describe('재료야아아얾니러임넝리ㅓㅣㅁㄴ아ㅓ', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [IngredientModule, StoreModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('GET /', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('{}');
    });
});