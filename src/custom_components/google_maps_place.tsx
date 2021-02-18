import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import { FormField } from "../pages/analyze";
import { InputAdornment } from '@material-ui/core';
import { PinDropSharp } from '@material-ui/icons';

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
}));

interface PlaceType {
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: [
      {
        offset: number;
        length: number;
      },
    ];
  };
  place_id: string;
}

// Note: this need to be outside the component?
const autocompleteService = { current: null };
const placesService = { current: null };

function updateQueryString(newValue: PlaceType | null) {
  // TODO: grab the placeId from the `newValue` and put that in the queryString
  console.log(`nv.placeId: ${newValue ? newValue.place_id : newValue}`);
}

// TODO: Can I use this for QS?
// https://developers.google.com/maps/documentation/javascript/reference/places-service

export function GoogleMaps({ field, formik }: { field: FormField, formik: any }) {
  const classes = useStyles();
  const [value, setValue] = React.useState<PlaceType | null>(null);
  // TODO: Initialize from querystring?
  const [inputValue, setInputValue] = React.useState('244 Brunswick Street, Jersey City, NJ, USA');
  const [options, setOptions] = React.useState<PlaceType[]>([]);

  // TODO: Need to add Powered by Google or Google logo: https://developers.google.com/places/web-service/policies

  const fetch = React.useMemo(
    () => (
      throttle((request: { input: string }, callback: (results: PlaceType[], status: any) => void) => {
        console.log("input: ", request.input);
        (autocompleteService.current as any).getPlacePredictions({ ...request, types: ['address'] }, callback);
      }, 200)
    ),
    [],
  );

  // TODO: This is mounting and unmounting when I change tabs --> may need to move up one component to avoid unmounting issue
  useEffect(function initializeGoogleMaps () {
    // https://www.robinwieruch.de/react-hooks-fetch-data
    // https://material-ui.com/components/autocomplete/#google-maps-place
    async function init() {
      loadScript(
        // TODO: Replace with PROD API KEY
        `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_LOCALHOST_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps',
      );

      // block on initialization of loading Google script
      while (!(window as any).google) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // console.log('google initialized: ', (window as any).google);

      // block on initialization of AutocompleteService
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      while (autocompleteService.current === null) {
        console.log('ac service: ', autocompleteService.current);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // console.log('ac initialized: ', autocompleteService.current, (autocompleteService.current as any).getPlacePredictions);

      placesService.current = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
      while (placesService.current === null) {
        console.log('places service: ', placesService.current);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // console.log('ac initialized: ', autocompleteService.current, (autocompleteService.current as any).getPlacePredictions);
      // console.log('places service: ', placesService.current, (placesService.current as any).getDetails);

      // TODO: Add error handling for invalid place id  
      (placesService.current as any).getDetails({ placeId: field.defaultValue, fields: ['ALL'] }, function cb(res: any[], err: any) {
        // console.log({ res });

        // @ts-ignore
        fetch({ input: res.formatted_address }, (results: PlaceType[], status: any) => {
          console.log({ results });
          setValue(results[0]);
          formik.setFieldValue('property_address', results[0].place_id);
        });
      })
    };

    init();
  }, []);

  // subsequent queries
  React.useEffect(() => {
    let active = true;

    console.log({ value, inputValue, fetch, autocompleteService, g: (window as any).google });

    if (!autocompleteService.current || !(window as any).google) {
      // autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      return undefined;
    }
    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results: PlaceType[], status: any) => {
      // console.log({ results });
      if (active) {
        let newOptions = [] as PlaceType[];
        if (value) {
          newOptions = [value];
        }
        if (results) {
          // setValue(results[0])
          newOptions = [...newOptions, ...results];
        }
        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: PlaceType | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);

        // TODO: Replace this with function that updates QS
        // updateQueryString(newValue);
        // TODO: Tie to TABS constant
        // TODO: newValue can be null, thus we need the ternary
        formik.setFieldValue('property_address', newValue ? newValue.place_id : newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          // TODO: Do I need these params
          {...params}
          label="Property Address"
          size="small"
          variant="outlined"
          fullWidth
          required={field.required}
          onBlur={formik.handleBlur} // https://stackoverflow.com/a/57481493
          // TODO: Errors are not working
          error={formik.touched[field.id] && Boolean(formik.errors[field.id])}
          helperText={formik.touched[field.id] && formik.errors[field.id]}

          // TODO: Add the ability to disable and set spinner while the API calls fire

          // TODO: How can I share this code with the code in Analyze
          // InputProps={{
          //   startAdornment: (
          //     field.startAdornment
          //       ? <InputAdornment position="start">{field.startAdornment}</InputAdornment>
          //       : null
          //   ),
          //   endAdornment: (
          //     field.endAdornment
          //       ? (
          //         <InputAdornment position="start">
          //           {field.endAdornment}
          //           {field.helperText && (
          //             <Tooltip title={<Paragraphs paragraphs={field.helperText}/>}>
          //               <Help fontSize="small" style={{ marginLeft: '5px' }} className={classes.helpIcon} />
          //             </Tooltip>
          //           )}
          //         </InputAdornment>
          //       )
          //       : null
          //   ),
          // }}
        />
      )}
      renderOption={(option) => {
        const matches = option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [match.offset, match.offset + match.length]),
        );

        return (
          <Grid container alignItems="center">
            <Grid item>
              <LocationOnIcon className={classes.icon} />
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                  {part.text}
                </span>
              ))}
              <Typography variant="body2" color="textSecondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
}

