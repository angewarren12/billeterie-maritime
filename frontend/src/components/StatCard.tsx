interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: string;
}

export default function StatCard({ icon, value, label, color }: StatCardProps) {
    return (
        <div className="card group hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:animate-float`}>
                    {icon}
                </div>
                <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                </div>
            </div>
        </div>
    );
}
