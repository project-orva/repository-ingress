import Sequalize from 'sequelize';
import lazyTruth from 'dour/utils/lazy-truth'
import { modeler } from 'dour'
import { DataSourceAdapter, DataSource, DataSourceModel } from 'dour/types'

export interface SequalizeConfiguration {
    database: string,
    username: string,
    password: string,
    dialect: string,
    host: string,
    post: number,
}

const covertType = (type: number) => lazyTruth({
    [modeler.Date]: Sequalize.DATE,
    [modeler.Number]: Sequalize.INTEGER,
    [modeler.String]: Sequalize.STRING,
}, (current) => current === type.toString())

export const translateModel = (model: any) =>
    Object.keys(model).reduce((a: any, c) => ({
        ...a,
        [c]: covertType(model[c])
    }), {})

export default (config: SequalizeConfiguration): DataSourceAdapter => {
    const seq = new Sequalize(
        config.database,
        config.username,
        config.password, {
        port: config.port,
        host: config.host,
        dialect: config.dialect,
    })

    seq.sync().catch((err: string) => console.error(`Error: Sequalize: ${err}`))

    return {
        dataSource: seq,
        translateModel,
    }
}