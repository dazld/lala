import {hashHistory} from 'react-router';
import fetch from 'isomorphic-fetch';
import Promise from 'bluebird';

export const UPDATE_USERNAME = 'UPDATE_USERNAME';
export const UPDATE_PASSWORD = 'UPDATE_PASSWORD';
export const CHECK_VALIDITY = 'CHECK_VALIDITY';

export function updateUsername(username){
    return {
        type: UPDATE_USERNAME,
        username
    }
}
export function updatePassword(password){
    return {
        type: UPDATE_PASSWORD,
        password
    }
}

export function updateValidity(validity){
    return {
        type: CHECK_VALIDITY,
        validity
    }
}

export function checkValidity(username){
    // returns a promise
    return function(dispatch, getstate){

        const state = getstate();


        const {username} = state.user.credentials;
        // console.log(state)
        const isValid = username === 'dan';
        const shouldThrow = Math.random() > 0.5;
        console.log(shouldThrow)
        return new Promise(function(res,rej){
            setTimeout(function(){
                if (shouldThrow) {
                    return rej(new Error('boom'));
                } else {
                    return res(dispatch({
                        type: CHECK_VALIDITY,
                        validity: isValid
                    }))
                }


            },500);
        });
    }
}
