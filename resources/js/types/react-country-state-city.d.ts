declare module "react-country-state-city" {
  export interface Country {
    id: number;
    name: string;
    iso2: string;
    latitude?: string;
    longitude?: string;
  }

  export interface State {
    id: number;
    name: string;
    country_id: number;
    iso2: string;
  }

  export interface City {
    id: number;
    name: string;
    state_id: number;
    country_id: number;
  }

  // Declaraciones de componentes como tipos genéricos sin 'any'
  export const CountrySelect: import('react').ComponentType<Record<string, unknown>>;
  export const StateSelect: import('react').ComponentType<Record<string, unknown>>;
  export const CitySelect: import('react').ComponentType<Record<string, unknown>>;
}

// ESM entrypoint usado en el proyecto
declare module "react-country-state-city/dist/esm/index" {
  export interface Country {
    id: number;
    name: string;
    iso2: string;
    latitude?: string;
    longitude?: string;
  }

  export interface State {
    id: number;
    name: string;
    country_id: number;
    iso2: string;
  }

  export interface City {
    id: number;
    name: string;
    state_id: number;
    country_id: number;
  }

  export function GetCountries(): Promise<Country[]>;
  export function GetState(countryId: number): Promise<State[]>;
  export function GetCity(countryId: number, stateId: number): Promise<City[]>;
}
