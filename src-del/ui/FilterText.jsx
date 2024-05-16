import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { useFilterGuest } from '../context/FilterGuestContext';
import { compareRef } from '../utils/helpers';

const StyledFilter = styled.div`
  border: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-sm);
  padding: 0.4rem;
  display: flex;
  gap: 0.4rem;
`;

const FilterInput = styled('input').withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})`
  background-color: var(--color-grey-0);
  border: none;

  ${(props) =>
    props.active &&
    css`
      background-color: var(--color-brand-600);
      color: var(--color-brand-50);
    `}

  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 1.4rem;
  /* To give the same height as select */
  padding: 0.44rem 0.8rem;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  }
`;

function FilterText({ filterField, placeholder, refFilterGuest }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get(filterField) || '';
  const [fieldText, setFieldText] = useState(currentFilter);
  const { filterGuest, setFilterGuest } = useFilterGuest();

  useEffect(() => {
    if (fieldText) {
      searchParams.set(filterField, fieldText);
      if (searchParams.get('page')) searchParams.set('page', 1);
      setSearchParams(searchParams);
    }
  }, [fieldText]);

  useEffect(function () {
    if (compareRef(filterGuest, refFilterGuest.current)) {
      refFilterGuest.current.focus();
    }
  }, []);

  function handleChange(e) {
    setFieldText(e.target.value);
    setFilterGuest(refFilterGuest.current);
  }

  return (
    <StyledFilter>
      <FilterInput
        type='text'
        placeholder={placeholder}
        value={fieldText}
        ref={refFilterGuest}
        onChange={handleChange}
        id={filterField}
      />
    </StyledFilter>
  );
}

export default FilterText;
