using Backend;
using Nethereum;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Web3;
using System;
using System.CodeDom.Compiler;
using System.Net;
using System.Net.NetworkInformation;
using System.Threading.Tasks;

namespace SolarFarmBackend.blockchain;

class BlockchainService
{
    private Web3 _web3;
    private readonly ILogger<BlockchainService> _logger;
    public BlockchainService(ILogger<BlockchainService> logger)
    {
        _logger = logger;
        var privateKey = "0xc2af33e1212b9d16de61540cd1133912ef3bc9b391421b029a60256d1637f75b";
        var account = new Nethereum.Web3.Accounts.Account(privateKey, 11155111);
        _web3 = new Web3(account, "https://1rpc.io/sepolia");

        _logger.LogInformation(account.Address.ToString());


        GenerateAccountsHelper();
    }

    private async void GenerateAccountsHelper()
    {
        //var ecKey = Nethereum.Signer.EthECKey.GenerateKey();
        //var privateKey = ecKey.GetPrivateKeyAsBytes().ToHex();
        //
        //var account = new Nethereum.Web3.Accounts.Account(privateKey);
        //_web3.Eth.Accounts.Creat
        //_logger.LogInformation("Account Address: " + account.Address.ToString() + " Private Key: " + account.PrivateKey.ToString());

        //var output = await _web3.Eth.Accounts.SendRequestAsync();
        //_logger.LogInformation(output.ToString());
        var balance = await _web3.Eth.GetBalance.SendRequestAsync("0x7728Bb890cEA31185Ce81f1cFAd6391e22A731af");
        var etherAmount = Web3.Convert.FromWei(balance.Value);
        _logger.LogInformation($"Balance in Ether: {etherAmount}");
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