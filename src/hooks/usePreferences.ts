import {useContext} from 'react';import {PreferencesContext} from '../context/preferences-state';
export const usePreferences=()=>useContext(PreferencesContext);
