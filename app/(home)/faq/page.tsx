'use client';

import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import {
  FaRegLightbulb,
  FaRegQuestionCircle,
  FaRegHandshake,
} from 'react-icons/fa';
import Link from 'next/link';

export default function FAQ() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<{
    section: 'clients' | 'craftsmen';
    idx: number;
  } | null>(null);

  const clientFaqs = useMemo(
    () =>
      t.raw('clients.questions') as {
        question: string;
        answer: string;
      }[],
    [t]
  );

  const craftsmanFaqs = useMemo(
    () =>
      t.raw('craftsmen.questions') as {
        question: string;
        answer: string;
      }[],
    [t]
  );

  const toggleAccordion = useCallback(
    (section: 'clients' | 'craftsmen', idx: number) => {
      setOpenIndex((prev) =>
        prev && prev.section === section && prev.idx === idx
          ? null
          : { section, idx }
      );
    },
    []
  );

  const isExpanded = useCallback(
    (section: 'clients' | 'craftsmen', idx: number) => {
      return !!(
        openIndex &&
        openIndex.section === section &&
        openIndex.idx === idx
      );
    },
    [openIndex]
  );

  const clientSideContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <FaRegQuestionCircle className="text-primary w-6 h-6" />
        <h3 className="text-lg font-semibold text-primary">
          {t('clients.sideTitle')}
        </h3>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <FaRegLightbulb className="text-warning w-5 h-5 animate-pulse" />
        <span className="text-sm text-foreground">{t('description')}</span>
      </div>
      <Link href="/contact">
        <Button variant="primary" size="lg" className="w-full">
          {t('clients.contactBtn')}
        </Button>
      </Link>
      <Link href="/how-it-works">
        <Button variant="outline" size="lg" className="w-full">
          {t('clients.howItWorks')}
        </Button>
      </Link>
    </div>
  );

  const craftsmanSideContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <FaRegHandshake className="text-primary w-6 h-6" />
        <h3 className="text-lg font-semibold text-primary">
          {t('craftsmen.sideTitle')}
        </h3>
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <FaRegLightbulb className="text-warning w-5 h-5 animate-pulse" />
        <span className="text-sm text-foreground">{t('description')}</span>
      </div>
      <Link href="/auth/register">
        <Button variant="primary" size="lg" className="w-full">
          {t('craftsmen.registerBtn')}
        </Button>
      </Link>
      <Link href="/about">
        <Button variant="outline" size="lg" className="w-full">
          {t('craftsmen.about')}
        </Button>
      </Link>
    </div>
  );

  const renderFaqSection = (
    section: 'clients' | 'craftsmen',
    faqs: { question: string; answer: string }[],
    sectionTitle: string,
    sideContent: React.ReactNode
  ) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary text-center">
        {sectionTitle}
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div className="w-full md:w-[500px] max-w-xl mx-auto bg-card border border-border rounded-3xl shadow-2xl p-8 md:p-12 animate-fadeIn transition-all duration-300 min-h-[400px]">
          {faqs.map((faq, idx) => (
            <div
              key={faq.question}
              className="border-b border-border last:border-b-0"
            >
              <button
                className="w-full flex justify-between items-center py-5 text-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-colors hover:bg-muted"
                onClick={() => toggleAccordion(section, idx)}
                aria-expanded={isExpanded(section, idx)}
                aria-controls={`faq-${section}-${idx}`}
                id={`faq-button-${section}-${idx}`}
              >
                <span>{faq.question}</span>
                <span
                  className={`ml-4 transition-transform ${
                    isExpanded(section, idx) ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  <IoIosArrowDown size={24} />
                </span>
              </button>
              <div
                id={`faq-${section}-${idx}`}
                role="region"
                aria-labelledby={`faq-button-${section}-${idx}`}
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded(section, idx)
                    ? 'max-h-40 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-5 text-muted-foreground animate-fadeIn break-words">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full md:w-80 max-w-md mx-auto bg-background/80 border border-border rounded-2xl shadow p-6 text-muted-foreground text-base">
          {sideContent}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-2xl" />
      </div>
      <Container
        maxWidth="lg"
        className="relative z-10 flex flex-col items-center justify-center py-24"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-foreground drop-shadow-lg tracking-tight">
          {t('title')}
        </h1>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
          {t('description')}
        </p>
        {renderFaqSection(
          'clients',
          clientFaqs,
          t('clients.sectionTitle'),
          clientSideContent
        )}
        {renderFaqSection(
          'craftsmen',
          craftsmanFaqs,
          t('craftsmen.sectionTitle'),
          craftsmanSideContent
        )}
      </Container>
    </section>
  );
}
