import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import _ from 'lodash';
import { FormField } from '../constants/analyzeFormFields';

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

// Note: this needs to be outside the component
const autocompleteService = { current: null };
const placesService = { current: null };

export function GoogleMaps({ field, formik }: { field: FormField, formik: any }) {
  const classes = useStyles();
  const [value, setValue] = React.useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = React.useState('');
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

  // initial page load
  useEffect(function initializeGoogleMaps () {
    // Design-pattern inspiration:
    // https://www.robinwieruch.de/react-hooks-fetch-data
    
    // Google Maps MUI docs:
    // https://material-ui.com/components/autocomplete/#google-maps-place
    
    async function init() {
      // block on initialization of loading Google script
      while (!(window as any).google) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // block on initialization of AutocompleteService
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
      while (autocompleteService.current === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // block on initialization of placesService
      placesService.current = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
      while (placesService.current === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      (placesService.current as any).getDetails({ placeId: formik.values.property_address, fields: ['ALL'] }, function cb(res: any[], err: any) {
        if (!_.isNull(res)) {
          // @ts-ignore
          fetch({ input: res.formatted_address }, (results: PlaceType[], status: any) => {
            setValue(results[0]);
            formik.setFieldValue('property_address', results[0].place_id);
          });
        } else {
          formik.setFieldValue('property_address', '');
        }
      });
    };

    init();
  }, []);

  // subsequent queries
  React.useEffect(() => {
    let active = true;

    // TODO: Document purpose of this if statement
    if (!autocompleteService.current || !(window as any).google) {
      return undefined;
    }
    // TODO: Document purpose of this if statement
    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results: PlaceType[], status: any) => {
      if (active) {
        let newOptions = [] as PlaceType[];
        if (value) {
          newOptions = [value];
        }
        if (results) {
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
        // TODO: What is the difference between these two functions? Shouldn't need both most likely
        formik.setFieldValue('property_address', newValue ? newValue.place_id : newValue);
        formik.handleChange(event);
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

          // TODO: WHY DO I NEED INPUTPROPS?

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

