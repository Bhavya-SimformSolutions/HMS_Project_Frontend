export const ACCESS_LEVELS_ALL = ['ADMIN', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PATIENT'];

export const SIDEBAR_LINKS = [
  {
    label: 'MENU',
    links: [
      { name: 'Dashboard', href: '/dashboard', access: ACCESS_LEVELS_ALL, icon: 'dashboard' },
      { name: 'Profile', href: '/profile', access: ['PATIENT'], icon: 'person' },
    ],
  },
  {
    label: 'Manage',
    links: [
      // { name: 'Users', href: '/record/users', access: ['ADMIN'], icon: 'group' },
      { name: 'Doctors', href: '/admin/doctors', access: ['ADMIN'], icon: 'medical_services' },
      { name: 'Appointments', href: '/doctor/appointments', access: ['DOCTOR'], icon: 'event' },
      // { name: 'Staffs', href: '/record/staffs', access: ['ADMIN', 'DOCTOR'], icon: 'people' },
      { name: 'Patients', href: '/record/patients', access: ['ADMIN'], icon: 'person' },
      { name: 'Patients', href: '/doctor/patients', access: ['DOCTOR'], icon: 'person' },
      { name: 'Appointments', href: '/record/appointments', access: ['ADMIN', 'NURSE'], icon: 'event' },
      { name: 'Medical Records', href: '/record/medical-records', access: ['ADMIN', 'DOCTOR'], icon: 'assignment' },
      { name: 'Billing Overview', href: '/record/billing', access: ['ADMIN'], icon: 'receipt' },
      { name: 'Billing Overview', href: '/doctor/billing', access: ['DOCTOR'], icon: 'receipt' },
      // { name: "Patient Management", href: "/nurse/patient-management", access: ["NURSE"], icon: 'people'},
      // { name: "Administer Medications", href: "/nurse/administer-medications", access: ["ADMIN", "DOCTOR"], icon: 'medication'},
      { name: "Appointments", href: "/appointments", access: ["PATIENT"], icon: 'event'},
      { name: "Records", href: "/patient/records", access: ["PATIENT"], icon: 'folder'},
      { name: "Prescription", href: "/patient/prescriptions", access: ["PATIENT"], icon: 'medication'},
      { name: "Billing", href: "/patient/billing", access: ["PATIENT"], icon: 'receipt'},
    ],
  },
  {
    label: 'System',
    links: [
      { name: 'Notifications', href: '/notifications', access: ACCESS_LEVELS_ALL, icon: 'notifications' },
      // { name: 'Audit Logs', href: '/admin/audit-logs', access: ['ADMIN'], icon: 'history' }, 
      { name: 'Settings', href: '/admin/system-settings', access: ['ADMIN'], icon: 'settings' },
    ],
  },
];