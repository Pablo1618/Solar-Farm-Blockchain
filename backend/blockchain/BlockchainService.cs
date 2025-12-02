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
using System.Numerics;
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
    private string _rpcAdress = "wss://ethereum-sepolia-rpc.publicnode.com";
    
    //Alternatywne adresy RPC
    //private string _rpcAdress = "https://1rpc.io/sepolia"; 
    //private string _rpcAdress = "wss://0xrpc.io/sep";

    private bool _debugLogging = false;
    private SolarTokenService _solarTokenService;
    public BlockchainService(ILogger<BlockchainService> logger)
    {
        _logger = logger;
        var account = new Nethereum.Web3.Accounts.Account(_mainAccountPrivateKey, 11155111);
        _web3 = new Web3(account, _rpcAdress);

        _solarTokenService = new SolarTokenService(_web3, _contractAdress);
        LogMainAccountBalance();
        _logger.LogInformation("Initialized blockchain service");
    }

    public async Task<BigInteger> GetAccountBalance(string Adress)
    {
        try
        {
            var result = await _solarTokenService.BalanceOfQueryAsync(new BalanceOfFunction { Account = Adress });
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogInformation("BalanceOf error (probably quota exceeded on rpc api)");
            return 0;
        }

        
    }
    public async Task TransferToAdress(string Adress, BigInteger Amount)
    {
        try
        {
            var receipt = await _solarTokenService.TransferRequestAndWaitForReceiptAsync(new TransferFunction { To = Adress, Value = Amount });
            if (_debugLogging)
            {
                _logger.LogInformation("Transfered: " + Amount.ToString() + " to adress: " + Adress);
            }
        }
        catch (Exception ex)
        {
            _logger.LogInformation("Transfer error (probably quota exceeded on rpc api)");
        }
        
        
        
    }
    private async Task<string> DeployContractAndGetAndGetAdress()
        {
        SolarTokenDeployment deployment = new SolarTokenDeployment();
        deployment.InitialSupply = 1000000000;
        SolarTokenService service = await ContractCompile.Contracts.SolarToken.SolarTokenService.DeployContractAndGetServiceAsync(_web3, deployment);
        return service.ContractAddress;
    }

    public Nethereum.Web3.Accounts.Account StringToAccount(string Name)
    {
        SHA256 mySHA256 = SHA256.Create();
        var namePostfix = "89f4569e";
        byte[] valueToHash = Encoding.ASCII.GetBytes(Name + namePostfix);
        byte[] privateKey = mySHA256.ComputeHash(valueToHash);
        var key = new Nethereum.Signer.EthECKey(privateKey, true);
        var account = new Nethereum.Web3.Accounts.Account(key);
        if (_debugLogging)
        {
            _logger.LogInformation("Account Address: " + account.Address.ToString() + " Private Key: " + account.PrivateKey.ToString());
        }
        return account;
    }
    private async Task LogMainAccountBalance()
    {
        var account = new Nethereum.Web3.Accounts.Account(_mainAccountPrivateKey, 11155111);
        var balance = await _web3.Eth.GetBalance.SendRequestAsync(account.Address);
        Console.WriteLine($"Balance in Wei: {balance.Value}");

        var etherAmount = Web3.Convert.FromWei(balance.Value);
        Console.WriteLine($"Balance in Ether: {etherAmount}");
    }
}