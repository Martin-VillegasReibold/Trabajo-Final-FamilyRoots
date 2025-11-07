declare module "react-country-state-city" {
  export type Country = { name: string };
  export type State = { name: string };
  export type City = { name: string };
  export const CountrySelect: React.FC<any>;
  export const StateSelect: React.FC<any>;
  export const CitySelect: React.FC<any>;
}
