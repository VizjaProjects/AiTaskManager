using System.Net.Mail;

namespace Ordovita.Domain.Identity;

public readonly record struct Email(string Value)
{
    public static Email From(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Adres email nie moze byc pusty", nameof(email));

        var trimmedEmail = email.Trim();

        if (!IsValidEmail(trimmedEmail))
            throw new ArgumentException("Podany adres email ma niepoprawny format lub zawiera niedozwolone znaki",
                nameof(email));

        return new Email(trimmedEmail);
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var mailAddress = new MailAddress(email);
            return mailAddress.Address == email;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public Email ChangeToEmail(string newEmailValue)
    {
        return From(newEmailValue);
    }
}