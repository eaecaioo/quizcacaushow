import { useState } from 'react';

// Importando imagens e ícones
import cacauShowLogoWhite from './assets/cacau-show-logo-white.png';
import ovoImg from './assets/cacau-show-ovo.png';

// Interface para as questões do quiz
interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    emoji: string;
  }[];
  emoji?: string;
}

// Interface para as respostas do usuário
interface UserAnswers {
  [key: number]: string;
}

// Interface para resposta da API de CEP
interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

function App() {
  // Lista de perguntas do quiz
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Como você avalia a qualidade dos chocolates da Cacau Show?",
      options: [
        { text: "Excelente", emoji: "😍" },
        { text: "Boa", emoji: "😊" },
        { text: "Regular", emoji: "😐" },
        { text: "Ruim", emoji: "😕" }
      ],
      emoji: "🍫"
    },
    {
      id: 2,
      question: "Qual a sua linha de produtos favorita da Cacau Show?",
      options: [
        { text: "Lacreme", emoji: "🍦" },
        { text: "Língua de Gato", emoji: "😺" },
        { text: "Bombons", emoji: "🎁" },
        { text: "Recheados", emoji: "🥮" }
      ],
      emoji: "🍬"
    },
    {
      id: 3,
      question: "Você já experimentou algum ovo de Páscoa da Cacau Show?",
      options: [
        { text: "Sim, todo ano", emoji: "🥚" },
        { text: "Sim, ocasionalmente", emoji: "🐣" },
        { text: "Raramente", emoji: "🐰" },
        { text: "Nunca experimentei", emoji: "❌" }
      ],
      emoji: "🐇"
    },
    {
      id: 4,
      question: "Qual característica você mais valoriza nos produtos da Cacau Show?",
      options: [
        { text: "Sabor", emoji: "😋" },
        { text: "Preço", emoji: "💰" },
        { text: "Variedade", emoji: "🧩" },
        { text: "Embalagem", emoji: "🎀" }
      ],
      emoji: "✨"
    },
    {
      id: 5,
      question: "Com que frequência você visita uma loja da Cacau Show?",
      options: [
        { text: "Semanalmente", emoji: "📅" },
        { text: "Mensalmente", emoji: "📆" },
        { text: "Em datas especiais", emoji: "🎂" },
        { text: "Raramente", emoji: "🕰️" }
      ],
      emoji: "🏬"
    },
    {
      id: 6,
      question: "Você recomendaria a Cacau Show para amigos e familiares?",
      options: [
        { text: "Com certeza", emoji: "👍" },
        { text: "Provavelmente", emoji: "🤔" },
        { text: "Talvez", emoji: "🤷" },
        { text: "Não recomendaria", emoji: "👎" }
      ],
      emoji: "👪"
    }
  ];

  // Estados do componente
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPromotion, setShowPromotion] = useState<boolean>(false);
  const [cep, setCep] = useState<string>("");
  const [isCheckingCep, setIsCheckingCep] = useState<boolean>(false);
  const [cepChecked, setCepChecked] = useState<boolean>(false);
  const [shippingValue, setShippingValue] = useState<number>(19.90);
  const [cityName, setCityName] = useState<string>("");
  const [ufState, setUfState] = useState<string>("");
  const [streetName, setStreetName] = useState<string>("");
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [stockCount, setStockCount] = useState<number>(0);
  const [shippingDate, setShippingDate] = useState<string>("");
  const [introError, setIntroError] = useState<string>("");

  // Função para validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para iniciar o quiz após preencher nome e email
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setIntroError("Por favor, informe seu nome completo.");
      return;
    }

    if (!userEmail.trim() || !isValidEmail(userEmail)) {
      setIntroError("Por favor, informe um e-mail válido.");
      return;
    }

    setIntroError("");
    setShowIntro(false);
  };

  // Função para avançar para a próxima pergunta
  const handleNextStep = () => {
    if (!selectedOption) {
      alert("Por favor, selecione uma opção para continuar.");
      return;
    }

    // Salvar resposta atual
    setUserAnswers({
      ...userAnswers,
      [currentStep]: selectedOption
    });

    // Se for a última pergunta, mostrar a promoção
    if (currentStep === quizQuestions.length) {
      setShowPromotion(true);
    } else {
      // Avançar para a próxima pergunta
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    }
  };

  // Função para selecionar uma opção
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };

  // Função para calcular o progresso do quiz
  const calculateProgress = () => {
    return (currentStep / quizQuestions.length) * 100;
  };

  // Função para consultar a API de CEP
  const fetchCepInfo = async (cepValue: string) => {
    try {
      const cleanCep = cepValue.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: CepResponse = await response.json();

      if(data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  // Função para verificar o CEP
  const handleCheckCep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cep.length < 8) {
      alert("Por favor, digite um CEP válido.");
      return;
    }

    setIsCheckingCep(true);

    // Usar a API ViaCEP para buscar os dados da cidade
    try {
      const cepData = await fetchCepInfo(cep);

      // Simulando um tempo de verificação para dar sensação de processamento
      setTimeout(() => {
        setIsCheckingCep(false);

        if (cepData) {
          setCityName(cepData.localidade);
          setUfState(cepData.uf);
          setStreetName(cepData.logradouro);
          setNeighborhood(cepData.bairro);
          setCepChecked(true);
          setShippingValue(19.90); // Valor fixo de frete

          // Definir um número aleatório de estoque (entre 2 e 5)
          setStockCount(Math.floor(Math.random() * 4) + 2);

          // Definir data de envio (3 dias úteis a partir de hoje)
          const today = new Date();
          today.setDate(today.getDate() + 3);
          // Formatar data para pt-BR
          setShippingDate(today.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }));
        } else {
          alert("CEP não encontrado. Por favor, tente novamente.");
        }
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        setIsCheckingCep(false);
        alert("Erro ao validar o CEP. Por favor, tente novamente.");
      }, 1500);
    }
  };

  // Função para ir para o pagamento
  const handleGoToPayment = () => {
    // Redirecionar para a página de pagamento fornecida
    window.location.href = "https://pay.sunize.com.br/RvcDIGJS";
  };

  // Formatar CEP enquanto digita
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    // Formatar como 00000-000
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    }

    setCep(value);
  };

  // Obtém a pergunta atual
  const currentQuestion = quizQuestions.find(q => q.id === currentStep) || quizQuestions[0];

  return (
    <div className="min-h-screen bg-[#f4f2f0] flex flex-col">
      {/* Header */}
      <header className="bg-[#3a2415] py-4 px-4 sm:px-6 flex justify-center items-center shadow-md">
        <div className="container max-w-3xl mx-auto flex justify-center items-center">
          <img
            src={cacauShowLogoWhite}
            alt="Cacau Show Logo"
            className="h-20 sm:h-24 my-2"
          />
        </div>
      </header>

      {/* Progress Bar (visível apenas durante o quiz) */}
      {!showPromotion && !showIntro && (
        <div className="container max-w-3xl mx-auto px-4 mt-2">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container max-w-3xl mx-auto px-4 py-6 page-container">
        {showIntro ? (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3a2415] mb-4">
                🍫 Pesquisa Especial de Páscoa 🍫
              </h1>
              <div className="bg-[#f8f0e5] rounded-lg p-3 mb-6 border-l-4 border-[#bda64d] text-left">
                <p className="font-bold text-[#3a2415] mb-2">Olá, Amante de Chocolate!</p>
                <p className="mb-2">A Cacau Show está realizando uma pesquisa especial para melhorar ainda mais nossos produtos para a Páscoa 2025.</p>
                <p className="mb-2">Como agradecimento pela sua participação, <span className="text-[#9e5328] font-bold">você receberá um delicioso ovo de chocolate GRÁTIS</span> - pagando apenas o frete para envio!</p>
              </div>

              <div className="bg-[#fdf0f0] rounded-lg p-3 mb-4 border-l-4 border-[#9e5328] text-left">
                <p className="font-bold text-[#9e5328]">⏱️ Oferta por tempo limitado!</p>
                <p>Temos apenas 500 ovos disponíveis para esta promoção. Responda nosso rápido questionário agora mesmo para garantir o seu!</p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                São apenas 6 perguntas rápidas sobre sua experiência com nossos chocolates.
              </p>
            </div>

            <form onSubmit={handleStartQuiz} className="space-y-4">
              <div>
                <label htmlFor="userName" className="block text-[#3a2415] font-medium mb-1">
                  Nome Completo*
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 border border-[#c5a28d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bda64d]"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div>
                <label htmlFor="userEmail" className="block text-[#3a2415] font-medium mb-1">
                  E-mail*
                </label>
                <input
                  type="email"
                  id="userEmail"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-3 border border-[#c5a28d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bda64d]"
                  placeholder="Digite seu melhor e-mail"
                  required
                />
              </div>

              {introError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                  <p>{introError}</p>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="btn-cacau w-full text-lg">
                  INICIAR PESQUISA E GANHAR OVO GRÁTIS!
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 mt-4">
                <img src="https://ext.same-assets.com/1998499652/2037836829.svg" alt="Segurança" className="h-8" />
                <img src="https://ext.same-assets.com/1998499652/928968323.png" alt="Garantia" className="h-8" />
              </div>

              <p className="text-center text-xs text-gray-500 mt-2">
                Ao participar, você concorda com nossos
                <span className="text-[#9e5328] font-medium"> Termos e Condições</span> e
                <span className="text-[#9e5328] font-medium"> Política de Privacidade</span>.
              </p>
            </form>
          </div>
        ) : !showPromotion ? (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 quiz-card">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-[#3a2415] mb-4 sm:mb-8 quiz-heading">
              {currentQuestion.emoji && <span className="mr-2">{currentQuestion.emoji}</span>}
              {currentQuestion.question}
            </h2>

            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm sm:text-base">Selecione uma opção para continuar:</p>
            </div>

            <div className="space-y-3 mb-6 sm:mb-8">
              {currentQuestion.options.map((option) => (
                <div
                  key={`option-${currentQuestion.id}-${option.text}`}
                  className={`quiz-option ${selectedOption === option.text ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(option.text)}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-[#c5a28d] mr-3 flex-shrink-0 flex items-center justify-center">
                    {selectedOption === option.text && (
                      <div className="w-3 h-3 rounded-full bg-[#bda64d]" />
                    )}
                  </div>
                  <div className="quiz-option-emoji">
                    {option.emoji}
                  </div>
                  <span className="ml-2 quiz-option-text">{option.text}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-cacau w-full"
              onClick={handleNextStep}
            >
              {currentStep === quizQuestions.length ? 'Finalizar' : 'Continuar'}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Pergunta {currentStep} de {quizQuestions.length}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3a2415] mb-2 sm:mb-4 promotion-heading">
                🎉 Parabéns, {userName.split(' ')[0]}! 🎉
              </h2>
              <p className="text-lg sm:text-xl text-[#9e5328] mb-2 promotion-subheading">
                Você foi contemplado com um
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#3a2415] mb-2 sm:mb-4 promotion-heading">
                Ovo de Páscoa da Cacau Show GRÁTIS!
              </h3>

              <div className="flex justify-center mb-4 sm:mb-6">
                <img
                  src={ovoImg}
                  alt="Ovo de Páscoa Cacau Show"
                  className="max-h-48 sm:max-h-72 mx-auto animate-pulse-slow"
                />
              </div>

              {!isCheckingCep && !cepChecked ? (
                <>
                  <div className="text-sm sm:text-base text-gray-700 mb-4 text-left sm:text-center px-2 sm:px-6">
                    <div className="bg-[#f8f0e5] rounded-lg p-3 mb-4 border-l-4 border-[#bda64d]">
                      <p className="font-bold text-[#3a2415] mb-2">🎁 Presente exclusivo para você:</p>
                      <p className="mb-2">Por sua participação, você está recebendo um <span className="text-[#9e5328] font-bold">ovo da Cacau Show TOTALMENTE GRÁTIS</span>! O chocolate é por nossa conta!</p>
                    </div>

                    <p className="mb-3"><strong>Por que existe uma taxa de envio?</strong></p>
                    <p className="mb-2">• Devido à alta demanda na Páscoa, precisamos cobrir <u>apenas os custos de embalagem especial e transporte refrigerado</u> para garantir que seu ovo chegue perfeito.</p>
                    <p className="mb-2">• Nossos ovos são frágeis e requerem embalagens especiais para não quebrarem durante o transporte.</p>
                    <p className="mb-2">• A taxa de envio é única: <span className="text-[#3a2415] font-bold">você não paga pelo chocolate, somente pelo frete!</span></p>

                    <div className="bg-[#fdf0f0] rounded-lg p-3 mt-4 border-l-4 border-[#9e5328]">
                      <p className="text-[#9e5328] font-bold">⚠️ Atenção:</p>
                      <p>Nosso último lote de ovos gratuitos está sendo distribuído. Verifique disponibilidade para sua região agora!</p>
                    </div>
                  </div>

                  <form onSubmit={handleCheckCep} className="mt-6">
                    <div className="mb-3">
                      <label htmlFor="cep" className="block text-[#3a2415] font-medium mb-1 text-center">
                        Digite seu CEP para verificar o envio:
                      </label>
                      <input
                        type="text"
                        id="cep"
                        value={cep}
                        onChange={handleCepChange}
                        className="cep-input"
                        placeholder="00000-000"
                        maxLength={9}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-cacau w-full text-lg py-4 mt-4">
                      VERIFICAR DISPONIBILIDADE
                    </button>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Verificamos disponibilidade, valor de frete e prazo para sua região
                    </p>
                  </form>
                </>
              ) : isCheckingCep ? (
                <div className="my-6">
                  <div className="loading-circle" />
                  <p className="text-[#3a2415] font-medium text-center">
                    Verificando disponibilidade para seu CEP...
                  </p>
                </div>
              ) : (
                <div className="my-4">
                  <div className="success-checkmark">✓</div>
                  <h3 className="text-lg sm:text-xl text-[#3a2415] font-bold mb-1">
                    Disponível para seu endereço!
                  </h3>

                  <div className="bg-[#f4f2f0] rounded-lg p-3 sm:p-4 my-3 text-center">
                    <p className="text-[#3a2415] font-medium">
                      {streetName ? `${streetName}${neighborhood ? `, ${neighborhood}` : ''}` : 'Endereço'}
                    </p>
                    <p className="text-[#9e5328] font-medium">
                      {cityName && ufState ? `${cityName} - ${ufState}` : cep}
                    </p>
                    <p className="mt-2 text-[#3a2415]">
                      CEP: <span className="font-medium">{cep}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4 text-sm">
                    <div className="bg-white rounded-lg border border-[#c5a28d] p-3 text-center">
                      <p className="text-gray-600">Frete único</p>
                      <p className="text-xl font-bold text-[#3a2415]">R$ {shippingValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-[#c5a28d] p-3 text-center">
                      <p className="text-gray-600">Envio até</p>
                      <p className="text-xl font-bold text-[#3a2415]">{shippingDate}</p>
                    </div>
                  </div>

                  <div className="bg-[#fef8e2] border-l-4 border-[#f5a623] rounded-lg p-3 sm:p-4 mb-4 text-sm">
                    <p className="font-medium text-[#3a2415] flex items-center">
                      <span className="text-[#f5a623] text-xl mr-2">⚠️</span>
                      <span>
                        Estoque crítico! Apenas <span className="font-bold text-[#f5a623]">{stockCount} unidades</span> disponíveis para sua região.
                      </span>
                    </p>
                    <p className="text-xs mt-1 text-gray-700">Reservamos seu ovo por 15 minutos. Após esse período, não podemos garantir disponibilidade.</p>
                  </div>

                  <button
                    onClick={handleGoToPayment}
                    className="btn-cacau w-full text-lg py-4 mt-3 flex items-center justify-center"
                  >
                    <span className="mr-2">GARANTIR MEU OVO - PAGAR FRETE</span>
                    <span className="text-xl">→</span>
                  </button>

                  <p className="text-xs text-center mt-2 text-gray-600">
                    Pagamento 100% seguro. Entrega garantida ou seu dinheiro de volta.
                  </p>
                </div>
              )}

              <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                Ao participar da promoção, você concorda com nossos
                <span className="text-[#9e5328] font-medium"> Termos e Condições</span>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#3a2415] py-4 sm:py-6 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm sm:text-base">© 2025 Cacau Show - Todos os direitos reservados</p>
          <p className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-300">
            Esta é uma avaliação oficial da Cacau Show para melhorar nossos produtos e serviços.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
