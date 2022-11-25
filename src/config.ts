import { DataSourceOptions } from "typeorm";

interface StaffConfig {
    alarmNewOrder: boolean,
}

interface UserConfig {
    discountForVip: number,
    orderCountForVip: number,
}

enum Weekday { sun, mon, tue, wed, thu, fri, sat }

interface IngredientsConfig {
    deliveredOn: (keyof typeof Weekday)[],
}

type Time = `${number}:${number}`;

interface StoreConfig {
    openAt: Time,
    prepareAt: Time,
}

export interface Config {
    serverPort: number,
    socketPort: number,
    db: DataSourceOptions,

    store: StoreConfig,

    staff: StaffConfig,
    user: UserConfig,
    ingredients: IngredientsConfig,
}

const defaultConfig: Config = {
    serverPort: 8080,
    socketPort: 8000,

    db: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'dbname',
    },

    store: {
        openAt: '15:30',
        prepareAt: '15:00',
    },

    staff: {
        alarmNewOrder: true,
    },

    user: {
        discountForVip: 5000,
        orderCountForVip: 5,
    },

    ingredients: {
        deliveredOn: ['tue', 'fri'],
    }
};

function makeIngredientDeliveryDayIndexArray(origin: (keyof typeof Weekday)[]) {
    const result: boolean[] = [false, false, false, false, false, false, false];
    origin.forEach(weekday => { result[Weekday[weekday]] = true });
    return result;
}

import app from '../app.config';

const config: Config = {
    ...defaultConfig,
    ...app,
};

export default {
    ...config,
    ingredientDeliveryDays: makeIngredientDeliveryDayIndexArray(config.ingredients.deliveredOn),
}