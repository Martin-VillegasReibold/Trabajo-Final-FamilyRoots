// CustomSelect de los dropdowns para los países, estados y ciudades.
import Select, { Props as SelectProps, StylesConfig, GroupBase } from 'react-select';

// Usamos unknown para evitar 'any' pero permitir coerción interna de react-select
const customStyles: StylesConfig<unknown, false, GroupBase<unknown>> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 2px #10b98133' : provided.boxShadow,
      color: '#111827',
      fontSize: '1rem', // 16px
      fontWeight: 500,
      fontFamily: 'inherit',
    minHeight: 40,
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#fff',
    color: '#111827',
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#10b98122' : '#fff',
      color: '#111827',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    cursor: 'pointer',
  }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    }),
    input: (provided) => ({
      ...provided,
      color: '#111827',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    }),
};

const darkStyles: StylesConfig<unknown, false, GroupBase<unknown>> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1f2937',
    borderColor: state.isFocused ? '#10b981' : '#374151',
    boxShadow: state.isFocused ? '0 0 0 2px #10b98133' : provided.boxShadow,
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    minHeight: 40,
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#10b98144' : '#1f2937',
      color: '#f3f4f6',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    cursor: 'pointer',
  }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f3f4f6',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    }),
    input: (provided) => ({
      ...provided,
      color: '#f3f4f6',
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'inherit',
    }),
};

import React, { useEffect, useState } from 'react';

export default function CustomSelect<T>(props: SelectProps<T, boolean, GroupBase<T>>) {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Cast necesario: los estilos están definidos con unknown para ser agnósticos;
  // react-select acepta StylesConfig<T,...>. Al no acceder a valores específicos de T
  // es seguro el cast.
  return <Select {...props} styles={(isDark ? darkStyles : customStyles) as StylesConfig<T, boolean, GroupBase<T>>} />;
}
