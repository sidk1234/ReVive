import React from 'react';
import { List, ListInput, Button } from 'konsta/react';

/**
 * ZipInput renders a single list item allowing the user to enter a
 * postal code manually. A button on the right triggers an automatic
 * lookup using the device's location. When the location button is
 * pressed the parent component should request geolocation and call
 * the provided `onLocate` handler.
 */
export default function ZipInput({ zip, setZip, onLocate }) {
  return (
    <List strong inset className="mb-4">
      <ListInput
        label="Default ZIP"
        type="text"
        placeholder="Enter ZIP code"
        clearButton
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        input={
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 w-full bg-transparent outline-none"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Enter ZIP code"
            />
            <Button
              small
              outline
              className="ml-2"
              onClick={(e) => {
                e.preventDefault();
                onLocate();
              }}
            >
              📍
            </Button>
          </div>
        }
      />
    </List>
  );
}