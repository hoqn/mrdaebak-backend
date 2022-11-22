import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

export interface StaffConfig {
    alarm: StaffAlarmConfig,
}

export interface StaffAlarmConfig {
    newOrder?: boolean,
    underIngredientStock?: {
        currentStock: number,
    }
}

export interface UserConfig {
    discountForVip: number,
    orderCountForVip: number,
    alarm: UserAlarmConfig,
}

export interface UserAlarmConfig {
    changeOrderState?: boolean,
}

export interface IngredientsConfig {
    deliveredDate: {
        byDayOfWeek?: {
            sun?: boolean,
            mon?: boolean,
            tue?: boolean,
            wed?: boolean,
            thu?: boolean,
            fri?: boolean,
            sat?: boolean,
        },
    },
}

export interface Config {
    serverPort: number,
    socketPort: number,
    db: DataSourceOptions,
    staff: StaffConfig,
    user: UserConfig,
    ingredients: IngredientsConfig,
}

const defaultConfig: Config = {
    serverPort: 8080,
    socketPort: 1111,
    db: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'dbname',
        synchronize: false,
        /* TODO: false로 바꿀 것! */
    },
    staff: {
        alarm: {
            newOrder: true,
            underIngredientStock: {
                currentStock: 10,
            }
        }
    },
    user: {
        discountForVip: 5000,
        orderCountForVip: 5,
        alarm: {
            changeOrderState: true,
        }
    },
    ingredients: {
        deliveredDate: {
            byDayOfWeek: {
                mon: true,
                wed: true,
                fri: true,
            }
        }
    }
};

import config from '../app.config';
import config_s from '../app.config.s';

const c = process.env.EXPERIMENTAL ? config_s : config;

export const CONFIG: Config = { ...defaultConfig, ...c };