export const STAFF_DIRECTORY = [
    { id: "staff-1", name: "Sarah Johnson", email: "sarah.j@salon.com", specialization: "Hair Stylist" },
    { id: "staff-2", name: "Michael Chen", email: "michael.c@salon.com", specialization: "Colorist" },
    { id: "staff-3", name: "Emily Rodriguez", email: "emily.r@salon.com", specialization: "Nail Technician" },
    { id: "staff-4", name: "David Kim", email: "david.k@salon.com", specialization: "Massage Therapist" },
    { id: "staff-5", name: "Jessica Brown", email: "jessica.b@salon.com", specialization: "Esthetician" },
];

export const findStaffByName = (name) => {
    if (!name) {
        return undefined;
    }
    return STAFF_DIRECTORY.find((staff) => staff.name.toLowerCase() === name.toLowerCase());
};
