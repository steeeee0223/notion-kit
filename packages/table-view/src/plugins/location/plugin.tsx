import { useEffect, useId, useRef, useState } from "react";

import {
  locationLabel,
  locationValueSchema,
  type LocationPlugin,
  type LocationValue,
} from "@notion-kit/table-hook/plugins";
import {
  Button,
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldLabel,
  Input,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { PropertyCell, propertyMetadata } from "../property-cell";
import type { TableUiPlugin } from "../registry";
import { createCellRenderer, type CellRendererProps } from "../renderers";
import { DefaultGroupingValue } from "../utils";

const emptyLocation: LocationValue = { name: "", address: "" };
function locationMapUrl(location: LocationValue) {
  const query = location.coordinates
    ? `${location.coordinates.latitude},${location.coordinates.longitude}`
    : [location.name, location.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function LocationEditor({
  value,
  onSave,
}: {
  value: LocationValue | null;
  onSave: (value: LocationValue | null) => void;
}) {
  const { propertySources } = useTableViewCtx();
  const { searchLocations, reverseGeocode } = propertySources ?? {};
  const [draft, setDraft] = useState(value ?? emptyLocation);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<LocationValue[]>([]);
  const [searching, setSearching] = useState(false);
  const geolocationRequest = useRef<AbortController | null>(null);
  const nameId = useId();
  const addressId = useId();

  useEffect(() => {
    if (!searchLocations || !query.trim()) return;
    const request = new AbortController();
    const timeout = setTimeout(() => {
      setSearching(true);
      void searchLocations(query.trim(), request.signal)
        .then((locations) => {
          if (request.signal.aborted) return;
          setResults(
            locations.flatMap((location) => {
              const result = locationValueSchema.safeParse(location);
              return result.success ? [result.data] : [];
            }),
          );
        })
        .catch(() => {
          if (!request.signal.aborted)
            setStatus("Place search is unavailable. You can enter an address.");
        })
        .finally(() => {
          if (!request.signal.aborted) setSearching(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      request.abort();
    };
  }, [query, searchLocations]);

  useEffect(() => () => geolocationRequest.current?.abort(), []);
  const locate = () => {
    setStatus("Getting your location…");
    geolocationRequest.current?.abort();
    const request = new AbortController();
    geolocationRequest.current = request;
    const browser: { geolocation?: Geolocation } = navigator;
    if (!browser.geolocation) {
      setStatus("Current location is unavailable.");
      return;
    }
    browser.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        if (request.signal.aborted) return;
        const coordinates = { latitude, longitude };
        const coordinateLocation = { ...emptyLocation, coordinates };
        setDraft(coordinateLocation);
        setStatus("");
        if (reverseGeocode) {
          void reverseGeocode(coordinates, request.signal)
            .then((value) => {
              if (request.signal.aborted) return;
              const parsed = locationValueSchema.safeParse(value);
              if (parsed.success) setDraft({ ...parsed.data, coordinates });
            })
            .catch(() => undefined);
        }
      },
      () => {
        if (!request.signal.aborted)
          setStatus("Could not access your location.");
      },
      { timeout: 10_000 },
    );
  };
  const items = results.map((location, index) => ({
    value: String(index),
    label: [location.name, location.address].filter(Boolean).join(" · "),
    location,
  }));
  return (
    <div className="flex flex-col gap-2">
      {searchLocations && (
        <Combobox
          inline
          open
          items={Combobox.createItems(items, {
            getValue: ({ value }) => value,
            getLabel: ({ label }) => label,
          })}
          value={null}
          inputValue={query}
          onInputValueChange={(value) => {
            setQuery(value);
            setResults([]);
            setSearching(false);
            setStatus("");
          }}
          onValueChange={(value) => {
            const location = items.find(
              (item) => item.value === value,
            )?.location;
            if (location) onSave(location);
          }}
        >
          <ComboboxInput
            aria-label="Search places"
            placeholder="Search a name or address"
          />
          <ComboboxContent variant="inline">
            {query.trim() && (
              <ComboboxEmpty>
                {searching ? "Searching…" : "No places found"}
              </ComboboxEmpty>
            )}
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxCollection>
                  {(item: (typeof items)[number]) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      label={item.label}
                    />
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
      <Button variant="hint" onClick={locate}>
        Use current location
      </Button>
      {status && (
        <span role="status" className="text-secondary">
          {status}
        </span>
      )}
      <Field>
        <FieldLabel htmlFor={nameId}>Place name</FieldLabel>
        <Input
          id={nameId}
          value={draft.name}
          onChange={(event) => {
            geolocationRequest.current?.abort();
            setDraft({ ...draft, name: event.currentTarget.value });
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={addressId}>Address</FieldLabel>
        <Input
          id={addressId}
          value={draft.address}
          onChange={(event) => {
            geolocationRequest.current?.abort();
            setDraft({
              ...draft,
              address: event.currentTarget.value,
              coordinates: undefined,
            });
          }}
        />
      </Field>
      {locationLabel(draft) && (
        <a
          className="text-sm underline"
          href={locationMapUrl(draft)}
          target="_blank"
          rel="noreferrer"
        >
          Open in maps
        </a>
      )}
      <div className="flex justify-end gap-2">
        {value && (
          <Button variant="hint" onClick={() => onSave(null)}>
            Clear
          </Button>
        )}
        <Button
          onClick={() =>
            onSave({
              ...draft,
              name: draft.name.trim(),
              address: draft.address.trim(),
            })
          }
          disabled={!locationLabel(draft).trim()}
        >
          Save place
        </Button>
      </div>
    </div>
  );
}

function LocationCell(props: CellRendererProps<LocationValue | null>) {
  return (
    <PropertyCell
      cell={props}
      text={props.textValue}
      renderEditor={(close) => (
        <LocationEditor
          value={props.data}
          onSave={(value) => {
            props.onChange(value);
            close();
          }}
        />
      )}
    />
  );
}

export function location(): TableUiPlugin<LocationPlugin> {
  return {
    id: "location",
    ...propertyMetadata(
      "location",
      "Place",
      "Stores a place name, address, or your current location.",
    ),
    renderCell: createCellRenderer<LocationPlugin>((props) => (
      <LocationCell {...props} />
    )),
    renderGroupingValue: DefaultGroupingValue,
  };
}
