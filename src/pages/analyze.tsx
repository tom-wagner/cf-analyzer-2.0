import _ from "lodash";
import React, { useEffect, useMemo } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { AppBar, Box, InputAdornment, makeStyles, Tab, Tabs, TextField, TextFieldProps, Theme, Tooltip, Typography, useTheme } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import * as yup from "yup";
import NumberFormat from "react-number-format";
import { useFormik } from "formik";
import qs from "querystring";
import { Router, useRouter } from "../util/router";
import { GoogleMaps as GoogleMapsSearchBar } from "../custom_components/google_maps_place";
import { FormField, TabType, TABS } from "../constants/analyzeFormFields";

function Paragraphs(props: { paragraphs: string[] }) {
  return (
    <>
      {_.map(props.paragraphs, (p: string, idx: number) => (
        // TODO: Consider using standard MUI styling
        <p key={idx} style={{ fontSize: '0.8rem' }}>
          {p}
        </p>
      ))}
    </>
  );
}

function NumberFieldWithCommas(props: any) {
  return (
    <NumberFormat
      isNumericString={true}
      thousandSeparator={true}
      customInput={TextField}
      {...props}
    />
  );
}

// const FIELDS_TO_CONVERT_STRING_TO_NUMBER = new Set([
//   'purchase_price',
//   'monthly_rent',
//   'annual_taxes',
//   'monthly_insurance',
//   'closing_costs',
// ]);
// function getQueryStringValueById(id: string, router: any) {
//   if (FIELDS_TO_CONVERT_STRING_TO_NUMBER.has(id)) {
//     const numericValue = parseFloat(router.query[id].replace(/,/g, ''))
//     // console.log('id: ', id, 'numericValue: ', numericValue, 'q: ', router.query[id]);
//     return numericValue;
//   }

//   return router.query[id];
// }


function generateInitialValues(tabs: TabType[], router: any, validationSchema: any) {
  const initialValues: { [key: string]: number | string }  = {};
  _.forEach(tabs, (tab: TabType) => {
    _.forEach(tab.formFields, (f: FormField) => {
      let isFieldValid;
      try {
        // https://github.com/jquense/yup#mixedvalidatesyncatpath-string-value-any-options-object-any
        // const fieldValue = getQueryStringValueById(f.id, router);
        isFieldValid = validationSchema.validateSyncAt(f.id, router.query[f.id]);
      } catch (e) {
        console.log({ e });
        // do nothing on purpose to stop exception from being thrown
        // TODO: Consider doing something here, such as recording a metric
      }

      console.log({ isFieldValid, fieldVal: router.query[f.id], fid: f.id });
      initialValues[f.id] = isFieldValid ? router.query[f.id] : f.defaultValue;
    })
  });

  // purposely override f.property_address because it will be marked as invalid
  initialValues.property_address = router.query['property_address'];

  return initialValues;
}

function generateValidators(tabs: TabType[]) {
  const validators: { [key: string]: yup.BaseSchema | undefined } = {};
  _.forEach(tabs, (tab: TabType) => {
    _.forEach(tab.formFields, (f: FormField) => {
      validators[f.id] = f.validator;
    })
  });
  return validators;
}

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    marginTop: '12px',
  },
  // https://stackoverflow.com/questions/55952086/writing-css-in-js-code-to-remove-arrow-buttons-from-textfield
  number: {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0
    }
  },
  input: {
    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0
    }
  },
  helpIcon: {
    // TODO: Figure out what color is best here
    color: "grey",
  },
  tabPanel: {
    [theme.breakpoints.down('sm')]: {
      minWidth: 140,
      width: 140,
      lineHeight: 1.1,
    },
    [theme.breakpoints.up('md')]: {
      minWidth: 140,
      width: 140,
      lineHeight: 1.4,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    }
  },
  formGrid: {
    [theme.breakpoints.down('sm')]: {
      height: '160px',
      minHeight: '160px',
      overflow: 'scroll',
    },
    [theme.breakpoints.up('md')]: {
      height: '95px',
      minHeight: '95px',
    }
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      className={classes.formGrid}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="span">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type FormGridProps = {
  fields: FormField[],
  formik: any,
};

function FormGrid({ fields, formik }: FormGridProps) {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      {_.map(fields, (field: FormField) => {
        const shouldRenderGoogleMapsAutocomplete = (field.id === TABS[0].formFields[0].id);
        
        const ConditionalComponent = field.formatWithCommas ? NumberFieldWithCommas : TextField;
        
        return (
          // @ts-ignore
          <Grid key={field.id} item xs={12} sm={12} md={field.gridWidth} lg={field.gridWidth} xl={field.gridWidth}>
            {shouldRenderGoogleMapsAutocomplete && (
              <GoogleMapsSearchBar field={field} formik={formik} />
            )}
            {!shouldRenderGoogleMapsAutocomplete && (
              <ConditionalComponent 
                id={field.id}
                label={field.label}
                // TODO: type clashes with react-number-format --> type:	One of ['text', 'tel', 'password']
                // type={field.inputType}
                required={field.required}
                fullWidth // TODO: Consider styling options

                // formik:
                value={formik.values[field.id]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur} // https://stackoverflow.com/a/57481493
                error={formik.touched[field.id] && Boolean(formik.errors[field.id])}
                helperText={formik.touched[field.id] && formik.errors[field.id]}

                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    field.startAdornment
                      ? <InputAdornment position="start">{field.startAdornment}</InputAdornment>
                      : null
                  ),
                  endAdornment: (
                    field.endAdornment
                      ? (
                        <InputAdornment position="start">
                          {field.endAdornment}
                          {field.helperText && (
                            <Tooltip title={<Paragraphs paragraphs={field.helperText}/>}>
                              <Help fontSize="small" style={{ marginLeft: '5px' }} className={classes.helpIcon} />
                            </Tooltip>
                          )}
                        </InputAdornment>
                      )
                      : null
                  ),
                }}
                className={classes.number}
                variant="outlined"
                size="small"
              />            
            )}
          </Grid>
        );
      })}
      {/* TODO: Consider adding button to go to next tab here */}
    </Grid>
  );
}

type NewGenericTabsProps = {
  tabs: TabType[],
  formik: any,
};

function GenericTabs(props: NewGenericTabsProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const handleTabChange = useMemo(() => (event: React.ChangeEvent<{}>, newValue: number) => setValue(newValue), []);

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          scrollButtons="off"
          variant="scrollable"
        >
          {props.tabs.map((tab: TabType, idx) => (
            <Tab key={idx} label={tab.tabTitle} {...a11yProps(idx)} className={classes.tabPanel} />
          ))}
        </Tabs>
      </AppBar>
      {props.tabs.map((tab: TabType, idx) => (
        <TabPanel key={idx} value={value} index={idx} dir={theme.direction}>
          <FormGrid fields={tab.formFields} formik={props.formik} />
        </TabPanel>
      ))}
    </div>
  );
}

// @ts-ignore
const validationSchema = yup.object(generateValidators(TABS));

// TODO: pass TABS into this component in case it becomes API call later
function AnalyzePage(props: any) {
  const classes = useStyles();
  const router = useRouter();

  // TODO: Should this be in a useEffect()?
  const formik = useFormik({
    initialValues: generateInitialValues(TABS, router, validationSchema),
    validationSchema,
    // TODO: Delete submit? seems like it is not used
    onSubmit: v => console.log(v),
    // TODO: Figure out validation --> do I need this setting?
    // validateOnBlur: true,
  });

  useEffect(() => {
    router.history.replace('/analyze?' + qs.stringify(formik.values));
    formik.validateForm();
  }, [formik.values]);

  // console.log(formik.values);
  // // @ts-ignore
  // console.log('qs parse: ', router.query['purchase_price']);
  // // @ts-ignore
  // console.log('typeof qs parse: ', typeof router.query['purchase_price']);

  return (
    // TODO: Utilize MUI theming / spacing
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* TODO: Consider adding button allowing users to hide inputs */}
          <form>
            <GenericTabs tabs={TABS} formik={formik} />
          </form>
        </Grid>
        <Grid item xs={12}>
          {/* <GoogleMapsSearchBar /> */}
          <div>
            {_.map(formik.values, (v: string, k: string) => {
              return <p key={k}>{`${k}: ${v}`}</p>
            })}
          </div>
          <div>
            {_.map(formik.errors, (v: string, k: string) => {
              return <p key={k}>{`${k}: ${v}`}</p>
            })}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AnalyzePage;
