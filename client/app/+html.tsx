import { ScrollViewStyleReset } from "expo-router/html";

type RootProps = {
  children: React.ReactNode;
};

export default function Root({ children }: RootProps) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta
          name="description"
          content="Ordovita pomaga planowac zadania, organizowac kalendarz i zarzadzac dniem z pomoca AI."
        />
        <ScrollViewStyleReset />
        <style>{`
          #ordovita-legal-links {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2147483647;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            padding: 8px 16px;
            border-top: 1px solid rgba(91, 78, 224, 0.16);
            background: #ffffff;
            font-family: Arial, sans-serif;
          }

          #ordovita-legal-links a,
          #ordovita-legal-links span {
            color: #2a2555;
            font-size: 13px;
            line-height: 18px;
            text-decoration: none;
          }

          #ordovita-legal-links a {
            font-weight: 600;
          }

          #ordovita-legal-links a:hover {
            text-decoration: underline;
          }

          .dark #ordovita-legal-links {
            background: #1a1d2e;
            border-top-color: rgba(255, 255, 255, 0.12);
          }

          .dark #ordovita-legal-links a,
          .dark #ordovita-legal-links span {
            color: #e8e8e8;
          }

          @media (max-width: 640px) {
            #ordovita-legal-links {
              gap: 10px;
              padding: 6px 12px;
            }

            #ordovita-legal-links a,
            #ordovita-legal-links span {
              font-size: 12px;
            }
          }
        `}</style>
      </head>
      <body>
        {children}
        <div id="ordovita-legal-links">
          <span>Ordovita</span>
          <a href="https://ordovita.pl/privacy-policy">Polityka prywatnosci</a>
          <a href="https://ordovita.pl/terms-of-service">Regulamin</a>
        </div>
      </body>
    </html>
  );
}
