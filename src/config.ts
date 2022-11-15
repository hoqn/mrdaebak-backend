import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

export interface ServerConfig {
    host: string,
    port: number,
}

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
    orderCountForVip: number,
    alarm: UserAlarmConfig,
}

export interface UserAlarmConfig {
    changeOrderState?: boolean,
}

export interface Config {
    server: ServerConfig,
    socketPort: number,
    db: DataSourceOptions,
    staff: StaffConfig,
    user: UserConfig,
}

const defaultConfig: Config = {
    server: {
        host: 'localhost',
        port: 8080,
    },
    socketPort: 1111,
    db: {
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'dbname',
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
        orderCountForVip: 5,
        alarm: {
            changeOrderState: true,
        }
    }
};

import appConfig from "../app.config";

export const CONFIG: Config = { ...defaultConfig, ...appConfig };