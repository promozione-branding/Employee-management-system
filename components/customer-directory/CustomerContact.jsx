import { Mail, Phone } from 'lucide-react';

export default function CustomerContact({ customer }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            {customer?.phone ? (
                <a href={'tel:' + customer.phone} className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-[#0F1B33] hover:text-[#F27B1E]">
                    <Phone size={13} className="shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                </a>
            ) : (
                <span className="text-sm text-[#8A92A6]">Phone not provided</span>
            )}
            {customer?.email && (
                <a href={'mailto:' + customer.email} className="inline-flex min-w-0 items-center gap-1.5 text-xs text-[#68738A] hover:text-[#F27B1E]">
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate">{customer.email}</span>
                </a>
            )}
        </div>
    );
}
