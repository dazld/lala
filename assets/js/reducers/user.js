import { combineReducers } from 'redux';

import {
    UPDATE_USERNAME,
    UPDATE_PASSWORD,
    CHECK_VALIDITY
} from '../actions';

function credentials(state, action){

    if (typeof state === 'undefined'){
        state = {
            username: '',
            password: '',
            validity: false
        }
    }

    switch(action.type){
        case UPDATE_USERNAME:
            const {username} = action;
            return {
                ...state,
                username
            };
            break;
        case UPDATE_PASSWORD:
            const {password} = action;
            return {
                ...state,
                password
            };
            break;
        case CHECK_VALIDITY:
            const {validity} = action;
            return {
                ...state,
                validity
            };
            break;
        default:
            return state;
            break;
    }
}

export default combineReducers({
    credentials
});
