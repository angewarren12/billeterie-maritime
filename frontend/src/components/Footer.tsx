export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-display font-bold mb-4">Maritime Express</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Votre compagnie de transport maritime de confiance.
                            Traversez le Sénégal en toute sécurité et confort.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Liens Rapides</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/" className="hover:text-ocean-400 transition">Accueil</a></li>
                            <li><a href="/trajets" className="hover:text-ocean-400 transition">Nos Trajets</a></li>
                            <li><a href="/tarifs" className="hover:text-ocean-400 transition">Tarifs</a></li>
                            <li><a href="/faq" className="hover:text-ocean-400 transition">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/reserver" className="hover:text-ocean-400 transition">Réserver un billet</a></li>
                            <li><a href="/mes-reservations" className="hover:text-ocean-400 transition">Mes réservations</a></li>
                            <li><a href="/abonnements" className="hover:text-ocean-400 transition">Abonnements</a></li>
                            <li><a href="/groupes" className="hover:text-ocean-400 transition">Voyages de groupe</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +221 33 XXX XX XX
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                contact@maritime-express.sn
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-ocean-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Port de Dakar, Sénégal
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; 2025 Maritime Express. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
