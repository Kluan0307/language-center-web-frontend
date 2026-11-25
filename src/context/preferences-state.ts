import {createContext} from 'react';import {defaults,type Preferences} from '../services/settingsService';
export const PreferencesContext=createContext({preferences:defaults,loading:false,error:undefined as string|undefined,apply:(_value:Preferences)=>{void _value;},reload:()=>{}});
