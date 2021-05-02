import * as yup from "yup";

export type FormField = {
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

export type TabType = {
    tabTitle: string,
    formFields: FormField[],
}

const stringToNumberYupTransformer = (_: any, val: any) => {
    console.log('running transformer!!: ', val, typeof val);
    const tmp = parseInt(val.replace(/,/, ''));
    console.log({ tmp }); 
    return tmp;
};


// const duplicateTransformer = (_: any, val: any) => {
//     console.log('running transformer!!: ', val, typeof val);
//     const tmp = parseInt(val.replace(/,/, ''));
//     console.log({ tmp }); 
//     return tmp;
// };


// TODO: Switch to constants because I am using some of these throughout the app
export const TABS: TabType[] = [
    // TODO: Consider allowing users to populate certain fields this from saved settings
    {
      tabTitle: 'Purchase Details',
      formFields: [
        // TODO: Integrate with Google Maps API
        // https://material-ui.com/components/autocomplete/#google-maps-place
        {
          id: 'property_address',
          label: 'Property Address',
          inputType: 'text',
          gridWidth: 4,
          required: true,
          defaultValue: '',
          startAdornment: '🏠',
          validator: yup
          .string()
          .required(),
        },
        // TODO: Purchase price not populating from querystring
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
            .transform(stringToNumberYupTransformer)
            .min(0, 'Purchase Price must be greater than or equal to $${min}.')
            .required()
        },
        // TODO: Convert to toggle, then conditionally show more fields
        {
          id: 'is_rehab',
          label: 'Rehab?',
          inputType: 'text',
          gridWidth: 2,
          defaultValue: 'No',
          validator: yup
            .string()
            .oneOf(['Yes', 'yes', 'No', 'no'], 'Must be either "Yes" or "No"')
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
          gridWidth: 2,
          required: true,
          defaultValue: '30',
          endAdornment: 'Years',
          formatWithCommas: true,
          validator: yup
            .number()
            // TODO: This seems to be broken
            .transform(stringToNumberYupTransformer)
            .test({
              test: (v: any) => {
                  console.log({ v, typeof: typeof v })
                  return v === 30 || v === 15;
              },
              message: 'Term must be either 15 or 30 years'
            })
            .required()
        },
        {
          id: 'percentage_down',
          label: 'Down Payment',
          inputType: 'number',
          gridWidth: 2,
          required: true,
          formatWithCommas: true,
          defaultValue: '20',
          endAdornment: '%',
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Down Payment Percentage must be greater than or equal to ${min}%.')
            .max(100, 'Down Payment Percentage must be less than or equal to ${max}%.')
            .required(),
        // TODO: Do we want this helper text?
        // helperText: [
        //   `Please note that PMI is not calculated or incorporated into the analysis regardless
        //   of the down payment percentage.`,
        // ],
        },
        {
          id: 'interest_rate',
          label: 'Interest Rate',
          inputType: 'number',
          gridWidth: 2,
          required: true,
          defaultValue: '2.75',
          formatWithCommas: true,
          endAdornment: '%',
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Interest Rate must be greater than or equal to ${min}%.')
            .max(100, 'Interest Rate must be less than or equal to ${max}%.')
            .required()
        },
        // TODO: Consider breaking this out into financed/not financed
        // TODO: Consider adding helper text to describe closing costs and mention that mortgage points should be included here
        {
          id: 'closing_costs',
          label: 'Closing Costs',
          inputType: 'number',
          gridWidth: 2,
          defaultValue: '0',
          startAdornment: '$',
          formatWithCommas: true,
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Closing Costs must be greater than or equal to $${min}.')
        },
        // TODO: Convert to toggle, share component/structure with is_rehab
        {
          id: 'closing_costs_financed',
          label: 'Financing Closing Costs?',
          inputType: 'text',
          gridWidth: 4,
          defaultValue: 'No',
          validator: yup
            .string()
            .oneOf(['Yes', 'yes', 'No', 'no'], 'Must be either "Yes" or "No"')
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
            .transform(stringToNumberYupTransformer)
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
          formatWithCommas: true,
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Annual Taxes must be greater than or equal to $${min}.')
            .required()
        },
        {
          id: 'monthly_insurance',
          label: 'Monthly Insurance Expense',
          inputType: 'number',
          gridWidth: 3,
          required: true,
          defaultValue: '200',
          startAdornment: '$',
          formatWithCommas: true,
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Monthly Insurance Expense must be greater than or equal to $${min}.')
            .required()
        },
      ],
    },
    {
      tabTitle: 'Variable Expenses',
      formFields: [
        // TODO: Consider adding post-vacancy toggle
        {
          id: 'capex_rate',
          label: 'CapEx Rate',
          inputType: 'number',
          gridWidth: 3,
          required: true,
          formatWithCommas: true,
          defaultValue: '5',
          endAdornment: '%',
          helperText: [
            `Capital Expenditures (Capex) Rate is calculated as the annual cost of major expenditures
            (ex: replacing the roof, a new water heater, etc.) divided by the gross annual rental
            income. It will vary greatly from property to property depending on age, location, cost
            and other factors.`,
            `Generally, setting aside 5-10% of rental income for CapEx is a good rule of thumb.`,
          ],
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Capex Rate must be greater than or equal to ${min}%.')
            .max(100, 'Capex Rate must be less than or equal to ${max}%.')
            .required()
        },
        // TODO: Consider adding post-vacancy toggle
        {
          id: 'repairs_rate',
          label: 'Repairs & Maintenance Rate',
          inputType: 'number',
          gridWidth: 3,
          required: true,
          formatWithCommas: true,
          defaultValue: '5',
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
            .transform(stringToNumberYupTransformer)
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
          formatWithCommas: true,
          defaultValue: '5',
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
            .transform(stringToNumberYupTransformer)
            .min(0, 'Vacancy Rate must be greater than or equal to ${min}%.')
            .max(100, 'Vacancy Rate must be less than or equal to ${max}%.')
            .required()
        },
        // TODO: Consider adding post-vacancy toggle
        {
          id: 'property_management_rate',
          label: 'Property Management Rate',
          inputType: 'number',
          gridWidth: 3,
          required: true,
          formatWithCommas: true,
          defaultValue: '12',
          endAdornment: '%',
          helperText: [
            `Property Management Rate is expressed as a percentage of total rental income and
            represents the amount charged by the property manager to manage your property.`,
            `Typical property management fees range from 9-12% depending on the market and
            services provided.`,
            `Enter '0' if you plan on managing your property yourself.`
          ],
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
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
          formatWithCommas: true,
          defaultValue: '2',
          endAdornment: '%',
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
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
          formatWithCommas: true,
          defaultValue: '2',
          endAdornment: '%',
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
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
          defaultValue: '2',
          endAdornment: '%',
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
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
          formatWithCommas: true,
          defaultValue: '8',
          endAdornment: '%',
          helperText: [
            `Selling Expense Rate represents the commission paid to the realtor
            upon the sale of your property.`,
            `Generally, this totals 5-10% of total sale proceeds.`
          ],
          validator: yup
            .number()
            .transform(stringToNumberYupTransformer)
            .min(0, 'Selling Expense Rate must be greater than or equal to ${min}%.')
            .max(100, 'Selling Expense Rate must be less than or equal to ${max}%.')
            .required()
        },
      ],
    },
  ];