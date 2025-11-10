import React from 'react';

type IconProps = {
  className?: string;
};

export const XIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const DotsHorizontalIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
    </svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);
export const ArrowDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
);


export const VisaIcon: React.FC<IconProps> = ({ className }) => ( <svg className={className} viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.5 0 .8.2.8.7l1.4 6.8zm-11.4-.4h-2c0-.1.1-.2.1-.2l2.1-6.5c.1-.2.3-.3.5-.3h1.4c.5 0 .7.2.5.7l-2.7 6.3zm-3.7.4h-1.8c-.1 0-.2 0-.2-.1V8.8c0-.1.1-.1.2-.1h1.8v6.9zm-1.5-8.1c0-.1.1-.2.2-.2h1.5v.1h-1.5v.1zm-3.1 8.1h-2.2c-.1 0-.2-.1-.2-.1l1.1-3.6-1-2.9c0-.1 0-.1.1-.2h2.2l.6 1.8.6-1.8h1.7l-1.9 5.2h-1.7l-1.1-3.1.1.1z" fill="#142688"></path></svg> );
export const StripeIcon: React.FC<IconProps> = ({ className }) => ( <svg className={className} width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-stripe"><title id="pi-stripe">Stripe</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" opacity=".07"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"></path><path d="M10.1 11.6c0 1.9 1.1 3.5 2.7 3.5s2.7-1.6 2.7-3.5V6.3c0-.4.4-.8.8-.8s.9.4.9.8v5.3c0 2.8-2 5.1-4.4 5.1S8.2 15 8.2 12.2V9.4c0-.4.4-.8.8-.8s.9.4.9.8v2.2zM22.2 6.3c0-.4.4-.8.8-.8.4 0 .8.3.8.8v8.4c0 .4-.3.8-.8.8s-.8-.4-.8-.8V6.3zM25.7 8.5c1.7 0 3.1.6 3.1 2.1 0 1.3-1 2-2.5 2.1v.1c1.2.1 2.1.9 2.1 2.1s-1.2 2-2.7 2h-2.5c-.4 0-.8-.3-.8-.8V9.3c0-.4.4-.8.8-.8h2.4zm-1.6 3.1h.9c.8 0 1.3-.3 1.3-.9s-.6-.9-1.4-.9h-.8v1.8zm0 3.2h1c.9 0 1.5-.4 1.5-1s-.6-1-1.6-1h-.9v2z" fill="#6772E5"></path></svg> );
export const PaypalIcon: React.FC<IconProps> = ({ className }) => ( <svg className={className} width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-paypal"><title id="pi-paypal">PayPal</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" opacity=".07"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"></path><path d="M12.1 4.5H8.3c-.3 0-.5.2-.6.5L4.7 16.7c-.1.3.1.6.4.6H8c.3 0 .5-.2.6-.5l.5-3.1c.1-.3.4-.5.7-.5h2.8c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5h3.1c.3 0 .6-.2.5-.5l-2.4-12c-.1-.4-.4-.6-.7-.6zm-2.4 8.2l.9-4.8.9 4.8h-1.8zM24.4 4.5h-3.2c-.3 0-.6.2-.6.5L19.2 12c0 .3.2.5.5.5h2.1c.4 0 .6-.2.7-.5l.4-2.1c.1-.3.3-.4.6-.4h1.3c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5h3.1c.3 0 .6-.2.5-.5l-2.4-12c-.1-.3-.4-.5-.7-.5zM22 9.7l.9-4.8.9 4.8H22zM33.4 4.5h-3.2c-.3 0-.6.2-.6.5L28.2 12c0 .3.2.5.5.5h2.1c.4 0 .6-.2.7-.5l.4-2.1c.1-.3.3-.4.6-.4h1.3c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5h3.1c.3 0 .6-.2.5-.5l-2.4-12c-.1-.3-.4-.5-.7-.5zM30 9.7l.9-4.8.9 4.8H30z" fill="#003087"></path><path d="M22.1 4.5h-3.2c-.3 0-.6.2-.6.5L16.9 12c0 .3.2.5.5.5h2.1c.4 0 .6-.2.7-.5l.4-2.1c.1-.3.3-.4.6-.4h1.3c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5H29c.3 0 .6-.2.5-.5l-2.4-12c-.1-.4-.4-.6-.7-.6zm-2.4 8.2l.9-4.8.9 4.8h-1.8zM30.4 4.5h-3.2c-.3 0-.6.2-.6.5L25.2 12c0 .3.2.5.5.5h2.1c.4 0 .6-.2.7-.5l.4-2.1c.1-.3.3-.4.6-.4h1.3c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5h3.1c.3 0 .6-.2.5-.5l-2.4-12c-.1-.3-.4-.5-.7-.5zm-2.4 8.2l.9-4.8.9 4.8h-1.8zM14.1 4.5H9.6c-.3 0-.5.2-.6.5L5.7 16.7c-.1.3.1.6.4.6h3.1c.3 0 .5-.2.6-.5l.5-3.1c.1-.3.4-.5.7-.5h2.8c.4 0 .6.2.7.5l.4 2.1c.1.3.3.5.6.5h3.1c.3 0 .6-.2.5-.5l-2.4-12c-.1-.4-.4-.6-.7-.6zm-2.4 8.2l.9-4.8.9 4.8h-1.8z" fill="#009cde"></path></svg> );
export const ApplePayIcon: React.FC<IconProps> = ({ className }) => ( <svg className={className} width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-apple_pay"><title id="pi-apple_pay">Apple Pay</title><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" opacity=".07"></path><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"></path><path d="M21.9 8.9c-.3 0-.6.1-.9.2-.3-.2-.6-.3-.9-.3-.5 0-1 .2-1.3.5-.4-.3-.8-.5-1.3-.5-.6 0-1.1.2-1.5.6-.4.4-.6.9-.6 1.5 0 .8.4 1.5.9 1.9.3.3.6.4.9.4.4 0 .7-.1.9-.3.2.1.5.3.8.3.5 0 .9-.2 1.2-.5.4.3.8.5 1.3.5.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5s-.2-1.1-.6-1.5c-.2-.2-.5-.3-.7-.4zm-5.9 3.7c-.3 0-.6-.1-.7-.3-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2.3 0 .6.1.7.3.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2zm2.3 0c-.3 0-.6-.1-.7-.3-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2.3 0 .6.1.7.3.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2zm2.3 0c-.3 0-.6-.1-.7-.3-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2.3 0 .6.1.7.3.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2zM15.1 12c.1-.1.2-.3.2-.5s-.1-.4-.2-.5c-.1-.1-.3-.2-.5-.2-.3 0-.6.1-.7.3-.1.1-.2.3-.2.5s.1.4.2.5c.1.1.3.2.5.2.3 0 .5-.1.7-.3zM16.5 6.9c-.7-.3-1.4-.4-2.2-.4-1.2 0-2.3.3-3.3.9-.9.6-1.5 1.4-1.8 2.3-.3 1-.4 2-.1 3 .2.9.7 1.7 1.3 2.4.6.6 1.4 1 2.2 1.2.2.1.5.1.7.1.8 0 1.5-.2 2.2-.5.7-.3 1.3-.8 1.8-1.3.5-.6.8-1.3.9-2.1.1-.8 0-1.6-.3-2.3-.2-.6-.6-1.1-1-1.6-.2-.2-.5-.4-.7-.5z" fill="#000"></path><path d="M12.4 8.2c-.3-.3-.8-.5-1.2-.5h-.1c-.4.1-.7.2-1 .4-.3.2-.5.5-.7.8-.2.3-.3.6-.3.9 0 .3.1.6.2.9.1.3.3.5.5.7.2.2.5.4.8.5.2.1.5.1.7.1h.1c.4 0 .8-.1 1.1-.4.3-.3.5-.6.6-.9.1-.4.1-.8.1-1.2s-.1-.8-.2-1.1c-.1-.2-.2-.4-.4-.6z" fill="#000"></path></svg> );
export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


export const HomeIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
export const CardIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> );
export const ScaleIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> );
export const DocumentTextIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> );
export const CogIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
export const ChevronDoubleLeftIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg> );
export const ChartPieIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg> );
export const CollectionIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h-2m-6 0h-2" /></svg> );


export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> );
export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> );