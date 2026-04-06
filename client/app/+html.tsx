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
            left: 16px;
            right: 16px;
            bottom: 16px;
            z-index: 2147483647;
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
            padding: 12px 16px;
            border-radius: 14px;
            border: 1px solid rgba(77, 65, 223, 0.16);
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(10px);
            box-shadow: 0 12px 40px rgba(15, 17, 23, 0.12);
            font-family: Arial, sans-serif;
          }

          #ordovita-legal-links a,
          #ordovita-legal-links span {
            color: #2a2555;
            font-size: 14px;
            line-height: 20px;
            text-decoration: none;
          }

          #ordovita-legal-links a {
            font-weight: 600;
          }

          #ordovita-legal-links a:hover {
            text-decoration: underline;
          }

          @media (max-width: 640px) {
            #ordovita-legal-links {
              bottom: 12px;
              gap: 10px;
              padding: 10px 12px;
            }

            #ordovita-legal-links a,
            #ordovita-legal-links span {
              font-size: 13px;
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
