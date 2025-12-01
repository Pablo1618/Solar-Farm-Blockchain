using Backend;
using ContractCompile.Contracts.SolarToken;
using ContractCompile.Contracts.SolarToken.ContractDefinition;
using Nethereum;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Model;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System;
using System.CodeDom.Compiler;
using System.Net;
using System.Net.NetworkInformation;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SolarFarmBackend.blockchain;

class BlockchainService
{
    private Web3 _web3;
    private readonly ILogger<BlockchainService> _logger;
    private string _mainAccountPrivateKey = "0xc2af33e1212b9d16de61540cd1133912ef3bc9b391421b029a60256d1637f75b";
    private string _contractAdress = "0x5f82cba1e72ac9dd9830184cf7f21128a00c64fd"; //Adres tokena ERC20
    private string _rpcAdress = "https://1rpc.io/sepolia";
    private SolarTokenService _solarTokenService;
    public BlockchainService(ILogger<BlockchainService> logger)
    {
        _logger = logger;
        var privateKey = "0xc2af33e1212b9d16de61540cd1133912ef3bc9b391421b029a60256d1637f75b";
        var account = new Nethereum.Web3.Accounts.Account(privateKey, 11155111);
        _web3 = new Web3(account, "https://1rpc.io/sepolia");

        _solarTokenService = new SolarTokenService(_web3, _contractAdress);
        
        var other_account = StringToAccount("0");

        var receipt = _solarTokenService.TransferRequestAndWaitForReceiptAsync(new TransferFunction { To = other_account.Address, Value = 1 });
        receipt.Wait();
        //_solarTokenService.TransferFromRequestAsync(new TransferFromFunction { From = account.Address, To = other_account.Address, Value = 1 }).Wait();

        var balance = _solarTokenService.BalanceOfQueryAsync(new BalanceOfFunction { Account = account.Address});
        balance.Wait();
        _logger.LogInformation("Balance: " + balance.Result);

        balance = _solarTokenService.BalanceOfQueryAsync(new BalanceOfFunction { Account = other_account.Address });
        balance.Wait();
        _logger.LogInformation("Balance: " + balance.Result);


        //var balance = _solarTokenService.BalanceOfQueryAsync(new BalanceOfFunction { Account = account.Address});
        //balance.Wait();
        //_logger.LogInformation("Balance: " + balance.Result);

        //var contractAdress = DeployContractAndGetAndGetAdress();
        //contractAdress.Wait();
        //_logger.LogInformation("Adress contract: " + contractAdress.Result);
    }

    private async Task<string> DeployContractAndGetAndGetAdress()
        {
        SolarTokenDeployment deployment = new SolarTokenDeployment();
        deployment.InitialSupply = 1000000000;
        SolarTokenService service = await ContractCompile.Contracts.SolarToken.SolarTokenService.DeployContractAndGetServiceAsync(_web3, deployment);
        return service.ContractAddress;
    }

    private Nethereum.Web3.Accounts.Account StringToAccount(string Name)
    {
        SHA256 mySHA256 = SHA256.Create();
        var namePostfix = "89f4569e";
        byte[] valueToHash = Encoding.ASCII.GetBytes(Name + namePostfix);
        byte[] privateKey = mySHA256.ComputeHash(valueToHash);
        var key = new Nethereum.Signer.EthECKey(privateKey, true);
        var account = new Nethereum.Web3.Accounts.Account(key);
        _logger.LogInformation("Account Address: " + account.Address.ToString() + " Private Key: " + account.PrivateKey.ToString());
        return account;
    }
    private async void GenerateAccountsHelper()
    {
        //var ecKey = Nethereum.Signer.EthECKey.GenerateKey();
        //var privateKey = ecKey.GetPrivateKeyAsBytes().ToHex();
        //var account = new Nethereum.Web3.Accounts.Account(privateKey);
        //_logger.LogInformation("Account Address: " + account.Address.ToString() + " Private Key: " + account.PrivateKey.ToString());
        //_web3.Eth.Accounts.Creat


        //var output = await _web3.Eth.Accounts.SendRequestAsync();
        //_logger.LogInformation(output.ToString());

        //Check balance
        //var balance = await _web3.Eth.GetBalance.SendRequestAsync("0x7728Bb890cEA31185Ce81f1cFAd6391e22A731af");
        //var etherAmount = Web3.Convert.FromWei(balance.Value);
        //_logger.LogInformation($"Balance in Ether: {etherAmount}");
    }
    static async Task GetAccountBalance()
    {
        var web3 = new Web3("https://rpc.sepolia.dev");
        var balance = await web3.Eth.GetBalance.SendRequestAsync("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae");
        Console.WriteLine($"Balance in Wei: {balance.Value}");

        var etherAmount = Web3.Convert.FromWei(balance.Value);
        Console.WriteLine($"Balance in Ether: {etherAmount}");
    }
}