import { modeler } from 'dour';
import compose, { handleModel, withModelRouter, withMiddleware } from 'dour/composer'
import { RequestContext, MiddlewareNext, CrudType } from 'dour/types'
import axios from 'axios';
import dotenv from 'dotenv';

import sequalizeAdapter from '@dour/sequelize-adapter'

dotenv.config()

const adapter = sequalizeAdapter({
    database: process.env.DEFAULT_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: Number(process.env.DB_PORT),
})

compose(
    withModelRouter(adapter),
    withMiddleware('auth', async (
        ctx: RequestContext, next: MiddlewareNext,
    ) => {
        const identityToken = ctx.request.headers['x-identity']

        if (typeof identityToken === 'undefined') {
            ctx.response.writeHead(400, "invalid headers")
            return
        }

        const { data } = await axios.post(`${process.env.AUTH_URI}/validate`, {
            'client_key': process.env.AUTH_KEY,
            'identity_token': identityToken,
        })

        if (!data.valid) {
            ctx.response.writeHead(401, "invalid credentials")
            return
        }

        next()
    }),
    handleModel('/account', {
        accountType: modeler.Number,
        createdOn: modeler.Date,
    }, [CrudType.CREATE, CrudType.READ, CrudType.UPDATE]),
    handleModel('/profile', {
        id: modeler.String,
        firstName: modeler.String,
        lastName: modeler.String,
        accessLevel: modeler.Number,
    }, [CrudType.CREATE, CrudType.READ, CrudType.UPDATE])
).start(3005, () => console.log('Service started on port 3005'))
