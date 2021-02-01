import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

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

const autocompleteService = { current: null };

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
}

export function GoogleMaps(props: any) {
  const classes = useStyles();
  const [value, setValue] = React.useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = React.useState('244 Brunswick Street, Jersey City, NJ, USA');
  const [options, setOptions] = React.useState<PlaceType[]>([]);
  const loaded = React.useRef(false);

  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      console.log('loading script!!');
      loadScript(
        // TODO: Replace with PROD API KEY
        `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_LOCALHOST_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps',
      );
    }

    loaded.current = true;
  }

  const fetch = React.useMemo(
    () => (
      throttle((request: { input: string }, callback: (results: PlaceType[], status: any) => void) => {
        console.log("input: ", request.input);
        (autocompleteService.current as any).getPlacePredictions({ ...request, types: ['address'] }, callback);
      }, 200)
    ),
    [],
  );

  // const service = await new (window as any).google.maps.places.AutocompleteService();
  // console.log({ service });

  // TODO: Consider using this --> https://www.robinwieruch.de/react-hooks-fetch-data

  // PLAN:
  // 1) kick off AutocompleteService()
  // 2) loop until 3seconds or autocompleteService.current has a value

  // populate from querystring if applicable
  React.useEffect(() => {
    // TODO: Need to everythig inside an async IIFE() --> see sleep1()

    console.log('mount!!');
    let active = true;

    async function sleep1() {
      console.log("sleep1 start");
      while (!(window as any).google) {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Sleeping...');
      }
      console.log("sleep1 done");
      console.log({ google: (window as any).google });

      if (!autocompleteService.current && (window as any).google) {
        // TODO: Async issue here --> need to somehow wait for this to initialize
        // useEffect on mount to set this --> then reference it as
        autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
        console.log({ ac: autocompleteService.current });
        // debugger;
      }
  
      async function sleep2() {
        console.log("sleep start");
        while (!autocompleteService.current) {
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log('Sleeping...');
        }
        console.log("sleep done");
        console.log({ ac: autocompleteService.current });
      }
      sleep2();
    }
    sleep1();

    // let i = 0;
    // block on initialization of service
    // while (!autocompleteService.current) {
    //   // consider using promise here to loop every .01 seconds, or whatever length
    //   sleep();
    //   i++;
    //   console.log(i);
    // }

    console.log('after sleep!', autocompleteService.current);

    if (!autocompleteService.current) {
      console.log('exiting!', autocompleteService.current);
      return undefined;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }
    
    console.log('fetching!!');
    fetch({ input: inputValue }, (results: PlaceType[], status: any) => {
      console.log('populating from querystring!');
      if (active) {
        let newOptions = [] as PlaceType[];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        // setOptions(newOptions);
        setValue(newOptions[0])
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // subsequent queries
  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }

    if (!autocompleteService.current) {
      return undefined;
    }

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
      style={{ width: 300 }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: PlaceType | null) => {
        console.log('New value: ', newValue);
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        console.log('New input value: ', newInputValue);
        // TODO: Store the property ID in the URL --> parse that in order to populate
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Add a location" variant="outlined" fullWidth size="small" />
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

