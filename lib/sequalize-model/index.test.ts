import { ModelTypes } from 'dour/model-router';
import Sequalize from 'sequelize';

import { translateModel } from './index';

describe('sequalize adapter', () => {
    describe('translateModel', () => {
        it('should translate correctly', () => {
            expect(translateModel({
                cake: ModelTypes.String,
                test: ModelTypes.Number,
                fast: ModelTypes.Date,
            })).toEqual({ "cake": Sequalize.STRING, "fast": Sequalize.DATE, "test": Sequalize.INTEGER })
        })
    })
})