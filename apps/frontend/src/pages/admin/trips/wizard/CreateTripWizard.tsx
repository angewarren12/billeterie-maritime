import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import Step1_RouteShip from './Step1_RouteShip';
import Step2_Schedule from './Step2_Schedule';
import Step3_Description from './Step3_Description';
import Step3_Pricing from './Step3_Pricing';
import Step4_Review from './Step4_Review';
import { toast } from 'react-hot-toast';
import { apiService } from '../../../../services/api';

const STEPS = [
    { id: 1, name: 'Trajet & Navire', icon: ClipboardDocumentListIcon },
    { id: 2, name: 'Horaires & Récurrence', icon: CalendarDaysIcon },
    { id: 3, name: 'Description & Photos', icon: PhotoIcon },
    { id: 4, name: 'Tarifs', icon: CurrencyDollarIcon },
    { id: 5, name: 'Révision', icon: CheckCircleIcon },
];

export interface WizardData {
    route_id: string;
    ship_id: string;
    description: string;
    create_return_trip: boolean;
    images?: File[];
    // Schedule
    is_recurring: boolean;
    single_date?: string;
    single_time?: string;
    recurrence_days: string[]; // ['monday', 'wednesday'...]
    start_date?: string;
    end_date?: string;
    times: string[]; // ['08:00', '14:00']
    // Pricing
    pricing_settings: {
        categories: {
            name: string;
            price: number;
            type: 'ADULT' | 'CHILD';
        }[];
    };
}

const INITIAL_DATA: WizardData = {
    route_id: '',
    ship_id: '',
    description: '',
    create_return_trip: false,
    images: [],
    is_recurring: false,
    recurrence_days: [],
    times: ['08:00'],
    pricing_settings: {
        categories: [
            { name: 'Résident Sénégal', price: 1500, type: 'ADULT' },
            { name: 'Enfant Résident Sénégal', price: 500, type: 'CHILD' },
            { name: 'Résident Afrique', price: 2700, type: 'ADULT' },
            { name: 'Enfant Résident Afrique', price: 1700, type: 'CHILD' },
            { name: 'Non Résident', price: 5200, type: 'ADULT' },
            { name: 'Enfant Non Résident', price: 2700, type: 'CHILD' },
        ],
    },
};

export default function CreateTripWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<WizardData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return !!data.route_id && !!data.ship_id;
            case 2:
                if (!data.is_recurring) {
                    return !!data.single_date && !!data.single_time;
                }
                return !!data.start_date && !!data.end_date && data.recurrence_days.length > 0 && data.times.length > 0;
            case 3:
                return true; // Description et photos optionnelles
            case 4:
                return data.pricing_settings.categories.every(cat => cat.price >= 0);
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!isStepValid()) {
            toast.error("Veuillez remplir tous les champs obligatoires avant de continuer.");
            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const routesData = await apiService.getAdminRoutes();
            const allRoutes: any[] = routesData.data || routesData;
            const currentRoute = allRoutes.find(r => String(r.id) === data.route_id);

            if (!currentRoute) throw new Error("Route non trouvée");

            let returnRouteId = '';
            if (data.create_return_trip) {
                const retRoute = allRoutes.find(r =>
                    String(r.departure_port.id) === String(currentRoute.arrival_port.id) &&
                    String(r.arrival_port.id) === String(currentRoute.departure_port.id)
                );
                if (retRoute) returnRouteId = String(retRoute.id);
            }

            const allGeneratedTrips = [];

            const processTrip = (departure: string, routeId: string) => {
                const arrivalDate = new Date(departure);
                arrivalDate.setMinutes(arrivalDate.getMinutes() + 30);
                const arrival = arrivalDate.toISOString().slice(0, 19).replace('T', ' ');

                return {
                    route_id: routeId,
                    ship_id: data.ship_id,
                    departure_time: departure,
                    arrival_time: arrival,
                    description: data.description,
                    status: 'scheduled',
                    pricing_settings: data.pricing_settings
                };
            };

            if (!data.is_recurring) {
                if (data.single_date && data.single_time) {
                    const departure = `${data.single_date} ${data.single_time}`;
                    allGeneratedTrips.push(processTrip(departure, data.route_id));

                    if (returnRouteId) {
                        const retDepartureDate = new Date(departure);
                        retDepartureDate.setHours(retDepartureDate.getHours() + 2);
                        const retDeparture = retDepartureDate.toISOString().slice(0, 19).replace('T', ' ');
                        allGeneratedTrips.push(processTrip(retDeparture, returnRouteId));
                    }
                }
            } else {
                if (data.start_date && data.end_date) {
                    let currentDate = new Date(data.start_date);
                    const end = new Date(data.end_date);

                    while (currentDate <= end) {
                        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        if (data.recurrence_days.includes(dayName)) {
                            const dateStr = currentDate.toISOString().split('T')[0];
                            for (const time of data.times) {
                                const departure = `${dateStr} ${time}`;
                                allGeneratedTrips.push(processTrip(departure, data.route_id));

                                if (returnRouteId) {
                                    const retDepDate = new Date(departure);
                                    retDepDate.setHours(retDepDate.getHours() + 2);
                                    const retDeparture = retDepDate.toISOString().slice(0, 19).replace('T', ' ');
                                    allGeneratedTrips.push(processTrip(retDeparture, returnRouteId));
                                }
                            }
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            }

            // Chunk submissions if too many trips (e.g., 50 per batch)
            const chunkSize = 50;
            for (let i = 0; i < allGeneratedTrips.length; i += chunkSize) {
                const chunk = allGeneratedTrips.slice(i, i + chunkSize);
                const formData = new FormData();

                chunk.forEach((trip, idx) => {
                    formData.append(`trips[${idx}][route_id]`, trip.route_id);
                    formData.append(`trips[${idx}][ship_id]`, trip.ship_id);
                    formData.append(`trips[${idx}][departure_time]`, trip.departure_time);
                    formData.append(`trips[${idx}][arrival_time]`, trip.arrival_time);
                    formData.append(`trips[${idx}][description]`, trip.description || '');
                    formData.append(`trips[${idx}][status]`, trip.status);

                    trip.pricing_settings.categories.forEach((cat, catIdx) => {
                        formData.append(`trips[${idx}][pricing_settings][categories][${catIdx}][name]`, cat.name);
                        formData.append(`trips[${idx}][pricing_settings][categories][${catIdx}][price]`, String(cat.price));
                        formData.append(`trips[${idx}][pricing_settings][categories][${catIdx}][type]`, cat.type);
                    });
                });

                // Common images
                if (data.images && data.images.length > 0) {
                    data.images.forEach((file) => {
                        formData.append('common_images[]', file);
                    });
                }

                await apiService.batchCreateTrips(formData);
            }

            toast.success(`${allGeneratedTrips.length} voyages créés avec succès !`);
            navigate('/admin/trips');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Création traversée</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Configurez vos voyages, horaires et tarifs.</p>
            </div>

            {/* Stepper */}
            <nav aria-label="Progress" className="mb-10">
                <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                    {STEPS.map((step) => {
                        const isComplete = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <li key={step.name} className="md:flex-1">
                                <div
                                    className={`group flex flex-col border-l-4 md:border-l-0 md:border-t-4 py-2 pl-4 md:pl-0 md:pt-4 transition-colors ${isCurrent
                                        ? 'border-ocean-600'
                                        : isComplete
                                            ? 'border-green-600'
                                            : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${isCurrent ? 'text-ocean-600' : isComplete ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                        Étape {step.id}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <step.icon className="w-4 h-4" />
                                        {step.name}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 min-h-[400px]">
                {currentStep === 1 && <Step1_RouteShip data={data} updateData={updateData} />}
                {currentStep === 2 && <Step2_Schedule data={data} updateData={updateData} />}
                {currentStep === 3 && <Step3_Description data={data} updateData={updateData} />}
                {currentStep === 4 && <Step3_Pricing data={data} updateData={updateData} />}
                {currentStep === 5 && <Step4_Review data={data} />}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Retour
                </button>
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-xl bg-ocean-600 text-white font-medium hover:bg-ocean-500 shadow-lg shadow-ocean-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Traitement...' : currentStep === STEPS.length ? 'Confirmer & Créer' : 'Suivant'}
                </button>
            </div>
        </div>
    );
}
