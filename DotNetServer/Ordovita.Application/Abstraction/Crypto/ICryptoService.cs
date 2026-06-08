namespace Ordovita.Application.Abstraction.Crypto;

public interface ICryptoService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}