import { modeler } from 'dour';
import compose, { handleModel, withModelRouter, withMiddleware } from 'dour/composer'
import { RequestContext, MiddlewareNext, CrudType } from 'dour/types'
import axios from 'axios';
import dotenv from 'dotenv';

import sequalizeAdapter from './lib/sequalize-model'

dotenv.config()

const adapter = sequalizeAdapter({
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: 'postgres'
})

compose(
    withModelRouter(adapter),
    withMiddleware('auth', async (
        ctx: RequestContext, next: MiddlewareNext,
    ) => {
        const identityToken = ctx.request.headers['X-Identity']

        if (!!identityToken) {
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
        accountId: modeler.String,
        accountType: modeler.Number,
        createdOn: modeler.Date,
    }, [CrudType.CREATE, CrudType.READ, CrudType.UPDATE]),
    handleModel('/profile', {
        profileId: modeler.String,
        firstName: modeler.String,
        lastName: modeler.String,
    }, [CrudType.CREATE, CrudType.READ, CrudType.UPDATE])
).start(3005, () => console.log('Service started on port 3005'))
