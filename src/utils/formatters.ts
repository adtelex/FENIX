import { Installment, StoreSettings } from '../types';

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(val || 0);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.includes('T') 
      ? dateStr.split('T')[0].split('-') 
      : dateStr.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

export const isOverdue = (dueDate: string): boolean => {
  if (!dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return dueDate < today;
};

export const cleanPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
};

export const formatPhoneDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const generateWhatsAppPaymentMessage = (
  installment: Installment,
  settings: StoreSettings
): string => {
  const overdue = installment.status === 'atrasado' || isOverdue(installment.dueDate);
  const formattedAmount = formatCurrency(installment.amount);
  const formattedDueDate = formatDate(installment.dueDate);

  if (overdue) {
    return `Olá, *${installment.customerName}*! Tudo bem? 😊

Passando para informar sobre a sua parcela *${installment.installmentNumber}/${installment.totalInstallments}* no valor de *${formattedAmount}*, referente a sua compra na *${settings.storeName}*, que venceu em *${formattedDueDate}*.

Podemos confirmar o pagamento para atualizar o seu carnê?

🔑 *Chave Pix (${settings.pixKeyType}):*
\`${settings.pixKey}\`
*Favorecido:* ${settings.ownerName}

Qualquer dúvida ou caso já tenha efetuado o pagamento, basta nos enviar o comprovante por aqui. Obrigado! 🙏`;
  }

  return `Olá, *${installment.customerName}*! Tudo bem? 😊

Lembrando com carinho da sua parcela *${installment.installmentNumber}/${installment.totalInstallments}* no valor de *${formattedAmount}* da *${settings.storeName}*, com vencimento para *${formattedDueDate}*.

🔑 *Chave Pix (${settings.pixKeyType}):*
\`${settings.pixKey}\`
*Favorecido:* ${settings.ownerName}

Assim que realizar o pagamento, por gentileza nos envie o comprovante para darmos baixa no sistema. Tenha um excelente dia! ✨`;
};

export const getWhatsAppLink = (phone: string, text: string): string => {
  const cleaned = cleanPhone(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};
