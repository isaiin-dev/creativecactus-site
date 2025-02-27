import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Send,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Shield
} from 'lucide-react';
import Header from '../components/layout/Header';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [meetingType, setMeetingType] = React.useState<'virtual' | 'in-person'>('virtual');
  const [duration, setDuration] = React.useState<'30' | '60'>('30');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Conecta con
            <span className="text-[#96C881]"> Nosotros</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Estamos aquí para ayudarte a alcanzar tus objetivos digitales.
            Elige el método de contacto que prefieras y comencemos a trabajar juntos.
          </p>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* WhatsApp */}
            <a
              href="https://wa.me/525512345678"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#242424] p-8 rounded-2xl border border-gray-800 hover:border-[#96C881] transition-all hover:-translate-y-1"
            >
              <MessageSquare className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">WhatsApp Business</h3>
              <p className="text-gray-400 mb-4">
                Respuesta inmediata a través de nuestro WhatsApp empresarial.
              </p>
              <span className="text-[#96C881] flex items-center gap-2 group-hover:gap-3 transition-all">
                Enviar mensaje
                <ArrowRight className="h-5 w-5" />
              </span>
            </a>

            {/* Email */}
            <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800">
              <Mail className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400 mb-4">
                hello@creativecactus.mx
              </p>
              <p className="text-sm text-gray-500">
                Respuesta en 24-48 horas hábiles
              </p>
            </div>

            {/* AI Assistant */}
            <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800">
              <Bot className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
              <div className="flex items-center gap-2 text-[#96C881] text-sm mb-4">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#96C881] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#96C881]" />
                </span>
                Online 24/7
              </div>
              <p className="text-gray-400">
                Respuestas instantáneas a preguntas frecuentes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
                    <p className="text-red-500 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-[#96C881]/20 border border-[#96C881]/50 rounded-lg">
                    <p className="text-[#96C881] flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Mensaje enviado correctamente. Te contactaremos pronto.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4" />
                  Tus datos están protegidos por nuestra política de privacidad
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>

            {/* Meeting Scheduler */}
            <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Agenda una Reunión</h2>
              
              <div className="space-y-6">
                {/* Meeting Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Reunión
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setMeetingType('virtual')}
                      className={`
                        p-4 rounded-lg border text-center transition-colors
                        ${meetingType === 'virtual'
                          ? 'bg-[#96C881]/20 border-[#96C881] text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'}
                      `}
                    >
                      <Globe className="h-5 w-5 mx-auto mb-2" />
                      Virtual
                    </button>
                    <button
                      onClick={() => setMeetingType('in-person')}
                      className={`
                        p-4 rounded-lg border text-center transition-colors
                        ${meetingType === 'in-person'
                          ? 'bg-[#96C881]/20 border-[#96C881] text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'}
                      `}
                    >
                      <MapPin className="h-5 w-5 mx-auto mb-2" />
                      Presencial
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duración
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDuration('30')}
                      className={`
                        p-4 rounded-lg border text-center transition-colors
                        ${duration === '30'
                          ? 'bg-[#96C881]/20 border-[#96C881] text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'}
                      `}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-2" />
                      30 minutos
                    </button>
                    <button
                      onClick={() => setDuration('60')}
                      className={`
                        p-4 rounded-lg border text-center transition-colors
                        ${duration === '60'
                          ? 'bg-[#96C881]/20 border-[#96C881] text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'}
                      `}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-2" />
                      60 minutos
                    </button>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horario Disponible
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-2 rounded-lg border text-center transition-colors
                          ${selectedTime === time
                            ? 'bg-[#96C881]/20 border-[#96C881] text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'}
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Handle meeting scheduling
                  }}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-5 w-5" />
                  Agendar Reunión
                </button>

                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Zona horaria: Ciudad de México (GMT-6)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Information */}
      <section className="py-20 px-4 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800">
              <MapPin className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ubicación</h3>
              <p className="text-gray-400">
                Av. Insurgentes Sur 1647<br />
                Col. San José Insurgentes<br />
                Ciudad de México, 03900
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800">
              <Clock className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Horario</h3>
              <p className="text-gray-400">
                Lunes a Viernes<br />
                9:00 AM - 6:00 PM<br />
                Hora del Centro (GMT-6)
              </p>
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800">
              <Phone className="h-8 w-8 text-[#96C881] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Teléfono</h3>
              <p className="text-gray-400">
                +52 (55) 1234-5678<br />
                Línea directa<br />
                Atención personalizada
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}