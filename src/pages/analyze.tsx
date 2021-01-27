import _ from "lodash";
import React, { useEffect, useMemo } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { AppBar, Box, InputAdornment, makeStyles, Tab, Tabs, TextField, TextFieldProps, Theme, Tooltip, Typography, useTheme } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import * as yup from "yup";
import NumberFormat from "react-number-format";
import { FormikConfig, FormikValues, useFormik } from "formik";
import { stringify } from "querystring";
import { useRouter } from "../util/router";
// TODO: Do I need this?
import classes from "*.module.css";

type FormField = {
  id: string,
  label: string,
  inputType: string,
  gridWidth: number,
  defaultValue: number | string,
  required?: boolean,
  startAdornment?: string,
  endAdornment?: string,
  helperText?: string[],
  formatWithCommas?: boolean,
  validator?: yup.BaseSchema,
};

type TabType = {
  tabTitle: string,
  formFields: FormField[],
}

function Paragraphs(props: { paragraphs: string[] }) {
  return (
    <>
      {_.map(props.paragraphs, p => (
        // TODO: Consider using standard MUI styling
        <p style={{ fontSize: '0.8rem' }}>
          {p}
        </p>
      ))}
    </>
  );
}

const TABS: TabType[] = [
  // TODO: Consider allowing users to populate certain fields this from saved settings
  {
    tabTitle: 'Purchase Details',
    formFields: [
      // TODO: Integrate with Google Maps API
      // TODO: Add Validator Functions
      {
        id: 'property_address',
        label: 'Property Address',
        inputType: 'text',
        gridWidth: 6,
        required: true,
        defaultValue: '',
        startAdornment: '🏠',
        validator: yup.string().required(),
      },
      {
        id: 'purchase_price',
        label: 'Purchase Price',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: '',
        startAdornment: '$',
        formatWithCommas: true,
        validator: yup
          .number()
          .min(0, 'Purchase Price must be greater than or equal to $${min}.')
          .required()
      },
      {
        id: 'closing_costs',
        label: 'Closing Costs',
        inputType: 'number',
        gridWidth: 3,
        defaultValue: '',
        startAdornment: '$',
        formatWithCommas: true,
        validator: yup
          .number()
          .min(0, 'Closing Costs must be greater than or equal to $${min}.')
      },
    ],
  },
  {
    tabTitle: 'Loan Details',
    formFields: [
      // TODO: Consider adding as buttons or dropdown later
      // {
      //   id: 'loan_type',
      //   label: 'Loan Type',
      //   inputType: 'text',
      //   gridWidth: 3,
      //   defaultValue: '',
      //   required: true,
      //   validator: yup.string().required(),
      // },
      // TODO: Maybe remove or make radio buttons
      {
        id: 'term',
        label: 'Loan Term',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 30,
        endAdornment: 'Years',
        validator: yup
          .mixed()
          .oneOf([15, 30], 'Loan Term must be either 15 or 30 years.')
          .required()
      },
      {
        id: 'percentage_down',
        label: 'Down Payment Percentage',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 20,
        endAdornment: '%',
        validator: yup
          .number()
          .min(0, 'Down Payment Percentage must be greater than or equal to ${min}%.')
          .max(100, 'Down Payment Percentage must be less than or equal to ${max}%.')
          .required(),
        helperText: [
          `Please note that PMI is not calculated or incorporated into the analysis regardless
          of the down payment percentage.`,
        ],
      },
      {
        id: 'interest_rate',
        label: 'Interest Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 2.75,
        endAdornment: '%',
        validator: yup
          .number()
          .min(0, 'Interest Rate must be greater than or equal to ${min}%.')
          .max(100, 'Interest Rate must be less than or equal to ${max}%.')
          .required()
      },
    ],
  },
  {
    tabTitle: 'Fixed Income and Expenses',
    formFields: [
      {
        id: 'monthly_rent',
        label: 'Monthly Rent',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: '',
        startAdornment: '$',
        formatWithCommas: true,
        validator: yup
          .number()
          .min(0, 'Monthly Rent must be greater than or equal to $${min}.')
          .required()
      },
      // TODO: This needs to be a dollar amount or tied to dollar amount field
      {
        id: 'annual_taxes',
        label: 'Annual Taxes',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: '',
        startAdornment: '$',
        validator: yup
          .number()
          .min(0, 'Annual Taxes must be greater than or equal to $${min}.')
          .required()
      },
      {
        id: 'monthly_insurance',
        label: 'Monthly Insurance Expense',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 200,
        endAdornment: '$',
        formatWithCommas: true,
        validator: yup
          .number()
          .min(0, 'Monthly Insurance Expense must be greater than or equal to $${min}.')
          .required()
      },
    ],
  },
  {
    tabTitle: 'Variable Expenses',
    formFields: [
      {
        id: 'capex_rate',
        label: 'Capital Expenditures (Capex) Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [
          `Capital Expenditures Rate is calculated as the annual cost of major expenditures
          (ex: replacing the roof, a new water heater, etc.) divided by the gross annual rental
          income. It will vary greatly from property to property depending on age, location, cost
          and other factors.`,
          `Generally, setting aside 5-10% of rental income for CapEx is a good rule of thumb.`,
        ],
        validator: yup
          .number()
          .min(0, 'Capex Rate must be greater than or equal to ${min}%.')
          .max(100, 'Capex Rate must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'repairs_rate',
        label: 'Repairs & Maintenance Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [
          `Repairs & Maintenance Rate is calculated as the annual cost of property repairs
          (ex: a broken window, fixing the dishwasher, etc.) divided by the gross annual rental
          income.`,
          `Generally, setting aside 5-10% of rental income for repairs is a good
          rule of thumb.`
        ],
        validator: yup
          .number()
          .min(0, 'Repairs Rate must be greater than or equal to ${min}%.')
          .max(100, 'Repairs Rate must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'vacancy_rate',
        label: 'Vacancy Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [
          `Vacancy Rate is calculated as the percentage of time your property sits empty due
          to tentant turnover. This figure will vary depending on the property's location and
          condition, so talk to a local agent or investor to gain a better understanding of
          expected vacancy.`,
          `Typical vacancy rates range from 3-10%.`
        ],
        validator: yup
          .number()
          .min(0, 'Vacancy Rate must be greater than or equal to ${min}%.')
          .max(100, 'Vacancy Rate must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'property_management_rate',
        label: 'Property Management Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 12,
        endAdornment: '%',
        helperText: [
          `Property Management Rate is expressed as a percentage of total rental income and
          represents the amount charged by the property manager to manage your property.`,
          `Typical property management fees range from 9-12% depending on the market and
          services provided.`,
          `Enter 0 if you plan on managing your property yourself.`
        ],
        validator: yup
          .number()
          .min(0, 'Property Management Rate must be greater than or equal to ${min}%.')
          .max(100, 'Property Management Rate must be less than or equal to ${max}%.')
          .required()
      },
    ],
  },
  {
    tabTitle: 'Growth Assumptions',
    formFields: [
      {
        id: 'appreciation_rate',
        label: 'Annual Appreciation Rate',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
        validator: yup
          .number()
          .min(0, 'Annual Appreciation Rate must be greater than or equal to ${min}%.')
          .max(100, 'Annual Appreciation Rate must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'rent_growth',
        label: 'Annual Rent Growth',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
        validator: yup
          .number()
          .min(0, 'Annual Rent Growth must be greater than or equal to ${min}%.')
          .max(100, 'Annual Rent Growth must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'expense_growth',
        label: 'Annual Expense Growth',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
        validator: yup
          .number()
          .min(0, 'Annual Expense Growth must be greater than or equal to ${min}%.')
          .max(100, 'Annual Expense Growth must be less than or equal to ${max}%.')
          .required()
      },
      {
        id: 'selling_expense_rate',
        label: 'Selling Expense Rate',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 8,
        endAdornment: '%',
        helperText: [
          `Selling Expense Rate represents the commission paid to the realtor
          upon the sale of your property.`,
          `Generally, this totals 5-10% of total sale proceeds.`
        ],
        validator: yup
          .number()
          .min(0, 'Selling Expense Rate must be greater than or equal to ${min}%.')
          .max(100, 'Selling Expense Rate must be less than or equal to ${max}%.')
          .required()
      },
    ],
  },
];

function generateInitialValues(tabs: TabType[]) {
  const initialValues: { [key: string]: number | string }  = {};
  _.forEach(tabs, (tab: TabType) => {
    _.forEach(tab.formFields, (f: FormField) => {
      // @ts-ignore
      initialValues[f.id] = f.defaultValue;
    })
  });
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
    minWidth: 125,
    width: 125,
    lineHeight: 1.4,
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

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
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
  // const handleChangeWrapper = useMemo(
  //   () => (
  //     (e: React.ChangeEvent<any>) => {
  //       // TODO: Can't update querystring any more --> do I even need this custom function?
  //       formik.handleChange(e);
  //     }
  //   ),
  //   [formik.handleChange]
  // );


  const classes = useStyles();
  return (
    <Grid container spacing={2}>
      {_.map(fields, (field: FormField) => (
        // @ts-ignore
        <Grid key={field.id} item xs={field.gridWidth}>
          <TextField
            id={field.id}
            label={field.label}
            type={field.inputType}
            required={field.required}
            fullWidth // TODO: Consider styling options

            // formik:
            value={formik.values[field.id]}
            // TODO: Replace with wrapper function that also updates querystring
            onChange={formik.handleChange}
            onBlur={formik.handleBlur} // https://stackoverflow.com/a/57481493
            error={formik.touched[field.id] && Boolean(formik.errors[field.id])}
            helperText={formik.touched[field.id] && formik.errors[field.id]}

            // TODO: Need to add comma formatting

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
        </Grid>
      ))}
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

  // TODO: is this the right use of useMemo?
  const handleTabChange = useMemo(() => (event: React.ChangeEvent<{}>, newValue: number) => setValue(newValue), []);

  return (
    <div>
      <AppBar position="static" color="default">
        {/* TODO: Consider stepper instead of tabs */}
        <Tabs
          value={value}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
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

  const formik = useFormik({
    initialValues: generateInitialValues(TABS),
    validationSchema,
    onSubmit: v => console.log(v),
    // TODO: Figure out validation
    // validateOnBlur: true,
  });

  useEffect(() => {
    // TODO: This is not working --> seems to be related to the querystring messing with route matching
    // router.history.replace('/analyze?' + stringify(formik.values));
  }, [formik.values]);

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
      </Grid>
    </Container>
  );
}

export default AnalyzePage;
