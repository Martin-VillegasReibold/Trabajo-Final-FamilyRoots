import React, { useState, useEffect } from 'react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city/dist/esm/index';
import CustomSelect from './CustomSelect';
import 'react-country-state-city/dist/react-country-state-city.css';

export interface PlaceLocationValue {
  country?: string;
  state?: string;
  city?: string;
}

interface PlaceLocationProps {
  value: PlaceLocationValue;
  onChange: (value: PlaceLocationValue) => void;
  label?: string;
}

type CountryType = { id: number; name: string; iso2: string };
type StateType = { id: number; name: string; country_id: number; iso2: string };
type CityType = { id: number; name: string; state_id: number; country_id: number };

const PlaceLocation: React.FC<PlaceLocationProps> = ({ value, onChange, label }) => {
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [countryObj, setCountryObj] = useState<CountryType | null>(null);
  const [stateObj, setStateObj] = useState<StateType | null>(null);
  const [countries, setCountries] = useState<CountryType[]>([]);
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);

  // Sincronizar los valores locales con los props recibidos
  useEffect(() => {
    setCountry(value.country || '');
    setState(value.state || '');
    setCity(value.city || '');

    // Buscar el objeto país correspondiente
    if (value.country && countries.length > 0) {
      const foundCountry = countries.find(c => c.name === value.country);
      setCountryObj(foundCountry || null);
    } else {
      setCountryObj(null);
    }

    // Buscar el objeto estado correspondiente
    if (value.state && states.length > 0) {
      const foundState = states.find(s => s.name === value.state);
      setStateObj(foundState || null);
    } else {
      setStateObj(null);
    }
  }, [value, countries, states]);
  useEffect(() => {
    GetCountries().then((data) => setCountries(data as CountryType[]));
  }, []);

  useEffect(() => {
    if (countryObj) {
      GetState(countryObj.id).then((data) => setStates(data as StateType[]));
    } else {
      setStates([]);
    }
    setStateObj(null);
    setCities([]);
    // No reiniciar state/city aquí, lo maneja el efecto de sincronización
  }, [countryObj]);

  useEffect(() => {
    if (countryObj && stateObj) {
      GetCity(countryObj.id, stateObj.id).then((data) => setCities(data as CityType[]));
    } else {
      setCities([]);
    }
    // No reiniciar city aquí, lo maneja el efecto de sincronización
  }, [countryObj, stateObj]);

  // Eliminado: la sincronización ahora se maneja en el efecto principal

  return (
    <div className="space-y-3">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
          <CustomSelect<CountryType>
            options={countries}
            getOptionLabel={option => option.name}
            formatOptionLabel={(option: CountryType) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <img
                  src={`https://flagcdn.com/24x18/${option.iso2.toLowerCase()}.png`}
                  alt={option.name}
                  style={{ width: '24px', height: '18px', borderRadius: '2px', boxShadow: '0 0 2px #0002' }}
                  loading="lazy"
                />
                {option.name}
              </span>
            )}
            getOptionValue={option => String(option.id)}
            value={countryObj}
            onChange={option => {
              if (!option || Array.isArray(option)) {
                setCountry('');
                setCountryObj(null);
                setStateObj(null);
                onChange({ country: '', state: '', city: '' });
                return;
              }
              const country = option as CountryType;
              setCountry(country.name);
              setCountryObj(country);
              setStateObj(null);
              onChange({ country: country.name, state: '', city: '' });
            }}
            placeholder="Selecciona..."
            isClearable
            classNamePrefix="custom-select"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Estado/Provincia</label>
          <CustomSelect<StateType>
            options={states}
            getOptionLabel={option => option.name}
            getOptionValue={option => String(option.id)}
            value={stateObj}
              onChange={option => {
                if (!option || Array.isArray(option)) {
                  setState('');
                  setStateObj(null);
                  onChange({ country: countryObj?.name || country, state: '', city: '' });
                  return;
                }
                const state = option as StateType;
                setState(state.name);
                setStateObj(state);
                onChange({ country: countryObj?.name || country, state: state.name, city: '' });
              }}
            placeholder="Selecciona..."
            isClearable
            classNamePrefix="custom-select"
            isDisabled={!countryObj}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
          <CustomSelect<CityType>
            options={cities}
            getOptionLabel={option => option.name}
            getOptionValue={option => String(option.id)}
            value={cities.find((c: CityType) => c.name === city) || null}
              onChange={option => {
                if (!option || Array.isArray(option)) {
                  setCity('');
                  onChange({ country: countryObj?.name || country, state: stateObj?.name || state, city: '' });
                  return;
                }
                const city = option as CityType;
                setCity(city.name);
                onChange({ country: countryObj?.name || country, state: stateObj?.name || state, city: city.name });
              }}
            placeholder="Selecciona..."
            isClearable
            classNamePrefix="custom-select"
            isDisabled={!countryObj || !stateObj}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaceLocation;
